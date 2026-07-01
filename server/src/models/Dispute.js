const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  type: { type: String, enum: ['payment', 'cancellation', 'quality', 'behavior', 'other'], required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'closed'], default: 'open' },
  resolution: { type: String, default: '' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
