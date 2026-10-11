const router = require('express').Router();
const { createOrder, verifyPayment, getPaymentStatus, refundPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/security');

router.post('/create-order', protect, paymentLimiter, createOrder);
router.post('/verify', protect, paymentLimiter, verifyPayment);
router.get('/:id', protect, getPaymentStatus);
router.post('/:id/refund', protect, authorize('admin'), refundPayment);

module.exports = router;
