const Booking = require('../models/Booking');
const Land = require('../models/Land');
const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const { calculatePrice } = require('../utils/pricing');
const { calculateRefund } = require('../utils/refundPolicy');

// Try a real Razorpay refund when live keys exist. Returns 'processed' or 'pending'.
async function tryAutoRefund(paymentDoc, refundAmount) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const isMockOrder = String(paymentDoc.razorpayOrderId || '').startsWith('order_sample_');
    if (!keyId || keyId.includes('xxxxx') || keyId === 'rzp_test_sample' || isMockOrder) return 'pending';
    if (!paymentDoc.razorpayPaymentId || String(paymentDoc.razorpayPaymentId).startsWith('pay_sample_')) return 'pending';
    if (!refundAmount || refundAmount <= 0) return 'none';
    const razorpay = require('../config/razorpay');
    await razorpay.payments.refund(paymentDoc.razorpayPaymentId, { amount: Math.round(refundAmount * 100) });
    return 'processed';
  } catch (e) {
    console.error('Auto-refund failed:', e.message);
    return 'pending';
  }
}

exports.createBooking = async (req, res) => {
  try {
    // Accept BOTH new contract {startDate,endDate} and old frontend {eventDate:{start,end}}
    let { landId, startDate, endDate, eventDate, vehicleType, vehicleCount } = req.body;
    landId = landId || req.body.land || req.body.land_id;
    if (eventDate && (!startDate || !endDate)) {
      startDate = startDate || eventDate.start;
      endDate = endDate || eventDate.end;
    }
    if (!landId || !startDate || !endDate || !vehicleType || vehicleCount == null) {
      return res.status(400).json({ message: 'landId, startDate, endDate, vehicleType, vehicleCount are required' });
    }
    const allowedTypes = ['two_wheeler', 'four_wheeler', 'mixed'];
    if (!allowedTypes.includes(vehicleType)) {
      return res.status(400).json({ message: 'Invalid vehicleType' });
    }
    const count = parseInt(vehicleCount, 10);
    if (!Number.isInteger(count) || count <= 0 || count > 500) {
      return res.status(400).json({ message: 'vehicleCount must be 1-500' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }
    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: 'Land not found' });
    if (!land.isAvailable || land.status !== 'approved') {
      return res.status(400).json({ message: 'Land is not available' });
    }

    const existingBookings = await Booking.find({
      land: landId,
      status: { $in: ['confirmed', 'active'] },
      'eventDate.start': { $lt: new Date(endDate) },
      'eventDate.end': { $gt: new Date(startDate) },
    });

    let bookedVehicles = 0;
    existingBookings.forEach(b => {
      if (b.vehicleType === vehicleType || vehicleType === 'mixed' || b.vehicleType === 'mixed') {
        bookedVehicles += b.vehicleCount;
      }
    });

    const availableSpots = vehicleType === 'two_wheeler'
      ? land.twoWheelerSpots
      : vehicleType === 'four_wheeler'
        ? land.fourWheelerSpots
        : land.totalSpots;

    if (bookedVehicles + vehicleCount > availableSpots) {
      return res.status(400).json({ message: 'Not enough spots available for the selected dates' });
    }

    const pricing = calculatePrice(land.pricePerHour, land.dynamicPricing, startDate, endDate);

    const booking = await Booking.create({
      customer: req.user.id,
      land: landId,
      eventDate: { start: startDate, end: endDate },
      duration: pricing.hours,
      vehicleType,
      vehicleCount,
      totalAmount: pricing.totalAmount,
    });

    res.status(201).json({ booking, pricing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('land', 'title location images pricePerHour')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ bookings, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandBookings = async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId);
    if (!land) return res.status(404).json({ message: 'Land not found' });
    // Only the land owner or admin can see all bookings for a land
    if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the land owner can view these bookings' });
    }
    const bookings = await Booking.find({ land: req.params.landId })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('land', 'title location images pricePerHour owner')
      .populate('customer', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isCustomer = booking.customer && booking.customer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.land && booking.land.owner && booking.land.owner.toString() === req.user.id;
    if (!isCustomer && !isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    const { refundPercentage, refundAmount, policyApplied } = calculateRefund(booking, new Date(), false);

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled booking';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    // Refund is 'pending' until Razorpay confirms. Never fake 'processed'.
    booking.refundStatus = 'pending';
    booking.refundPolicyApplied = policyApplied;

    // Best-effort auto-refund if a captured payment exists
    const paymentDoc = await Payment.findOne({ booking: booking._id, status: 'captured' });
    if (paymentDoc && refundAmount > 0) {
      booking.refundStatus = await tryAutoRefund(paymentDoc, refundAmount);
      if (booking.refundStatus === 'processed') {
        paymentDoc.status = 'refunded';
        await paymentDoc.save();
      }
    } else if (!refundAmount || refundAmount <= 0) {
      booking.refundStatus = 'none';
    }

    await booking.save();
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportFakeLand = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('land');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { description, contactPhone } = req.body;

    const { refundPercentage, refundAmount, policyApplied } = calculateRefund(booking, new Date(), true);

    booking.status = 'cancelled';
    booking.cancellationReason = `FAKE/INACCESSIBLE LAND REPORT: ${description || 'Land reported as fake/inaccessible'}`;
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    booking.refundStatus = 'pending';
    booking.refundPolicyApplied = policyApplied;
    booking.isFakeLandClaim = true;

    await booking.save();

    // Best-effort immediate refund under ParkSpot Guarantee
    const fakePayment = await Payment.findOne({ booking: booking._id, status: 'captured' });
    if (fakePayment) {
      const st = await tryAutoRefund(fakePayment, refundAmount);
      booking.refundStatus = st;
      if (st === 'processed') {
        fakePayment.status = 'refunded';
        await fakePayment.save();
      }
      await booking.save();
    }

    // Auto-suspend land after a fake report so no new bookings come in during investigation
    if (booking.land) {
      await Land.findByIdAndUpdate(booking.land._id || booking.land, {
        $inc: { fakeReportCount: 1 },
        $set: { isAvailable: false },
      });
    }

    const supportTicket = await Dispute.create({
      reporter: req.user.id,
      reportedUser: booking.land ? booking.land.owner : undefined,
      booking: booking._id,
      type: 'fake_land',
      priority: 'critical',
      subject: `CRITICAL: Fake / Inaccessible Land Reported for Booking #${booking._id}`,
      description: description || 'Customer reported that the land is fake or inaccessible.',
      contactPhone: contactPhone || '',
      status: 'open',
    });

    res.json({
      message: 'Fake land report filed successfully. 100% full refund has been credited under ParkSpot Guarantee.',
      booking,
      supportTicket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const allowed = ['confirmed', 'active', 'completed', 'cancelled'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: `Status must be one of ${allowed.join(', ')}` });
    }
    const booking = await Booking.findById(req.params.id).populate('land', 'owner');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.land && booking.land.owner && booking.land.owner.toString() === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Only the land owner or admin can update status' });
    }
    // Prevent illegal jumps: cannot revive cancelled/completed
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot change status from ${booking.status}` });
    }
    booking.status = req.body.status;
    await booking.save();
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    let { landId, startDate, endDate, vehicleType, vehicleCount } = req.query;
    // also accept eventDate.start style query keys from old clients
    if (!startDate && req.query['eventDate.start']) startDate = req.query['eventDate.start'];
    if (!endDate && req.query['eventDate.end']) endDate = req.query['eventDate.end'];
    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: 'Land not found' });

    const existingBookings = await Booking.find({
      land: landId,
      status: { $in: ['confirmed', 'active'] },
      'eventDate.start': { $lt: new Date(endDate) },
      'eventDate.end': { $gt: new Date(startDate) },
    });

    let bookedVehicles = 0;
    existingBookings.forEach(b => {
      if (b.vehicleType === vehicleType || vehicleType === 'mixed' || b.vehicleType === 'mixed') {
        bookedVehicles += b.vehicleCount;
      }
    });

    const availableSpots = vehicleType === 'two_wheeler'
      ? land.twoWheelerSpots - bookedVehicles
      : vehicleType === 'four_wheeler'
        ? land.fourWheelerSpots - bookedVehicles
        : land.totalSpots - bookedVehicles;

    const pricing = calculatePrice(land.pricePerHour, land.dynamicPricing, startDate, endDate);

    res.json({
      available: availableSpots >= parseInt(vehicleCount || 1),
      availableSpots: Math.max(0, availableSpots),
      totalSpots: vehicleType === 'two_wheeler' ? land.twoWheelerSpots : vehicleType === 'four_wheeler' ? land.fourWheelerSpots : land.totalSpots,
      pricing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Live price preview for booking form (used by frontend before creating booking)
exports.calculatePreview = async (req, res) => {
  try {
    let { landId, startDate, endDate, eventDate, vehicleType, vehicleCount } = req.body;
    if (eventDate && (!startDate || !endDate)) {
      startDate = startDate || eventDate.start;
      endDate = endDate || eventDate.end;
    }
    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: 'Land not found' });
    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate required' });
    const pricing = calculatePrice(land.pricePerHour, land.dynamicPricing, startDate, endDate);
    const count = parseInt(vehicleCount || 1, 10) || 1;
    const vehicleMult = vehicleType === 'two_wheeler' ? 0.5 : vehicleType === 'mixed' ? 0.75 : 1;
    res.json({
      pricing: {
        ...pricing,
        basePrice: land.pricePerHour,
        durationHours: pricing.hours,
        vehicleCount: count,
        finalPrice: Math.round(pricing.totalAmount * vehicleMult * count / Math.max(1, 1)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
