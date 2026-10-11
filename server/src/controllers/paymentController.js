const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot pay for booking with status ${booking.status}` });
    }

    let order;
    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxxx') || process.env.RAZORPAY_KEY_ID === 'rzp_test_sample';

    // SECURITY: mock orders are dev-only. Never allow free bookings in production.
    if (isMock && process.env.NODE_ENV === 'production') {
      return res.status(503).json({ message: 'Payments not configured. Contact support.' });
    }

    if (isMock) {
      order = {
        id: `order_sample_${Date.now()}`,
        entity: 'order',
        amount: booking.totalAmount * 100,
        amount_paid: 0,
        amount_due: booking.totalAmount * 100,
        currency: 'INR',
        receipt: `booking_${bookingId}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      };
    } else {
      order = await razorpay.orders.create({
        amount: booking.totalAmount * 100,
        currency: 'INR',
        receipt: `booking_${bookingId}`,
      });
    }

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      currency: 'INR',
    });

    res.json({
      order,
      payment,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample',
      isMockMode: isMock,
      amount: booking.totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    // Accept BOTH camelCase (new) and snake_case (Razorpay checkout / old frontend)
    let { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    razorpayOrderId = razorpayOrderId || req.body.razorpay_order_id || req.body.orderId;
    razorpayPaymentId = razorpayPaymentId || req.body.razorpay_payment_id || req.body.paymentId;
    razorpaySignature = razorpaySignature || req.body.razorpay_signature || req.body.signature;
    if (!razorpayOrderId) return res.status(400).json({ message: 'razorpayOrderId is required' });

    const isMock = !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'xxxxx' || String(razorpayOrderId).startsWith('order_sample_');

    // SECURITY: never accept mock/sample payments in production
    if (isMock && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ message: 'Mock payments are not allowed in production' });
    }

    if (!isMock) {
      if (!razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'Payment id and signature are required' });
      }
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    if (payment.status === 'captured') {
      return res.status(400).json({ message: 'Payment already verified' });
    }
    // Only the payer can verify
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    payment.razorpayPaymentId = razorpayPaymentId || `pay_sample_${Date.now()}`;
    payment.razorpaySignature = razorpaySignature || `sig_sample_${Date.now()}`;
    payment.status = 'captured';
    payment.method = 'upi';
    await payment.save();

    await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed' });

    res.json({ message: 'Razorpay Payment verified successfully! Booking confirmed.', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: `Only captured payments can be refunded (current: ${payment.status})` });
    }
    const isMock = !process.env.RAZORPAY_KEY_ID || String(process.env.RAZORPAY_KEY_ID).includes('xxxxx') || String(payment.razorpayOrderId).startsWith('order_sample_');
    if (isMock) {
      // Dev-mode: mark refunded without calling Razorpay
      payment.status = 'refunded';
      await payment.save();
      await Booking.findByIdAndUpdate(payment.booking, { status: 'cancelled', refundStatus: 'processed' });
      return res.json({ message: 'Refund processed (mock mode)', refund: { mock: true } });
    }
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, { amount: Math.round(payment.amount * 100) });
    payment.status = 'refunded';
    await payment.save();
    await Booking.findByIdAndUpdate(payment.booking, { status: 'cancelled' });
    res.json({ message: 'Refund processed', refund });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
