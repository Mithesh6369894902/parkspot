const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  boundary: { type: [[Number]], default: [] },
  areaSqFt: { type: Number, default: 0 },
  totalSpots: { type: Number, default: 0 },
  twoWheelerSpots: { type: Number, default: 0 },
  fourWheelerSpots: { type: Number, default: 0 },
  pricePerHour: { type: Number, required: true },
  dynamicPricing: {
    peakMultiplier: { type: Number, default: 1.5 },
    weekendMultiplier: { type: Number, default: 1.3 },
    eventMultiplier: { type: Number, default: 2.0 },
  },
  images: [{ type: String }],
  amenities: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  availableDates: [{ start: Date, end: Date }],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

landSchema.index({ location: '2dsphere' });
landSchema.index({ status: 1, isAvailable: 1 });

module.exports = mongoose.model('Land', landSchema);
