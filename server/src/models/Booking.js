const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  land: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
  eventDate: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  duration: { type: Number, required: true },
  vehicleType: { type: String, enum: ['two_wheeler', 'four_wheeler', 'mixed'], required: true },
  vehicleCount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'], default: 'pending' },
  qrCode: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
}, { timestamps: true });

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ land: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
