const router = require('express').Router();
const { createReview, getLandReviews, replyToReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/land/:landId', getLandReviews);
router.put('/:id/reply', protect, authorize('owner', 'admin'), replyToReview);

module.exports = router;
