const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const order = await razorpay.orders.create({
      amount: booking.totalAmount * 100,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
    });

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      currency: 'INR',
    });

    res.json({ order, payment, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'captured';
    const order = await razorpay.orders.fetch(razorpayOrderId);
    payment.method = order.method || 'upi';
    await payment.save();

    await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed' });

    res.json({ message: 'Payment verified successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, { amount: payment.amount * 100 });
    payment.status = 'refunded';
    await payment.save();
    await Booking.findByIdAndUpdate(payment.booking, { status: 'cancelled' });
    res.json({ message: 'Refund processed', refund });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
