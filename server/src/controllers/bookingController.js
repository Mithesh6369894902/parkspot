const Booking = require('../models/Booking');
const Land = require('../models/Land');
const { calculatePrice } = require('../utils/pricing');

exports.createBooking = async (req, res) => {
  try {
    const { landId, startDate, endDate, vehicleType, vehicleCount } = req.body;
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
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('land', 'title location images pricePerHour')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandBookings = async (req, res) => {
  try {
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
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }
    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || '';
    await booking.save();
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { landId, startDate, endDate, vehicleType, vehicleCount } = req.query;
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
      available: availableSpots >= parseInt(vehicleCount),
      availableSpots: Math.max(0, availableSpots),
      pricing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
