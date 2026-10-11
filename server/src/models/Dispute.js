const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: { type: String, enum: ['fake_land', 'payment_issue', 'cancellation_refund', 'payment', 'cancellation', 'quality', 'behavior', 'general_inquiry', 'other'], default: 'other' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  subject: { type: String, default: '' },
  description: { type: String, required: true },
  contactPhone: { type: String, default: '' },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'closed'], default: 'open' },
  resolution: { type: String, default: '' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
