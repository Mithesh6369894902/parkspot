const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  land: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  ownerReply: { type: String, default: '' },
}, { timestamps: true });

reviewSchema.index({ land: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
