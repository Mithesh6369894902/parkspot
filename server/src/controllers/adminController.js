const User = require('../models/User');
const Land = require('../models/Land');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalLands, totalBookings, totalRevenue, pendingLands, openDisputes] = await Promise.all([
      User.countDocuments(),
      Land.countDocuments({ status: 'approved' }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
      Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Land.countDocuments({ status: 'pending' }),
      Dispute.countDocuments({ status: { $in: ['open', 'investigating'] } }),
    ]);
    res.json({
      totalUsers, totalLands, totalBookings,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      pendingLands, openDisputes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDispute = async (req, res) => {
  try {
    const { reportedUserId, bookingId, type, description } = req.body;
    const dispute = await Dispute.create({ reporter: req.user.id, reportedUser: reportedUserId, booking: bookingId, type, description });
    res.status(201).json({ dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDisputes = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const disputes = await Dispute.find(query).populate('reporter', 'name email').populate('reportedUser', 'name email').populate('booking').sort({ createdAt: -1 });
    res.json({ disputes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDispute = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, { status, resolution }, { new: true });
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    res.json({ dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addDisputeMessage = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    dispute.messages.push({ sender: req.user.id, message: req.body.message });
    await dispute.save();
    res.json({ dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
