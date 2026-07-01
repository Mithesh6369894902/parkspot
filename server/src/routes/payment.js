const router = require('express').Router();
const { createOrder, verifyPayment, getPaymentStatus, refundPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:id', protect, getPaymentStatus);
router.post('/:id/refund', protect, authorize('admin'), refundPayment);

module.exports = router;
