const Review = require('../models/Review');
const Land = require('../models/Land');

exports.createReview = async (req, res) => {
  try {
    const { landId, bookingId, rating, comment } = req.body;
    const existing = await Review.findOne({ user: req.user.id, booking: bookingId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this booking' });

    const review = await Review.create({ user: req.user.id, land: landId, booking: bookingId, rating, comment });

    const stats = await Review.aggregate([
      { $match: { land: review.land } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Land.findByIdAndUpdate(landId, { averageRating: Math.round(stats[0].avgRating * 10) / 10, reviewCount: stats[0].count });
    }

    res.status(201).json({ review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ land: req.params.landId }).populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.ownerReply = req.body.reply;
    await review.save();
    res.json({ review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
