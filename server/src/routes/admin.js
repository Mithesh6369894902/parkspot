const router = require('express').Router();
const { getDashboardStats, createDispute, getDisputes, updateDispute, addDisputeMessage } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.post('/disputes', protect, createDispute);
router.get('/disputes', protect, authorize('admin'), getDisputes);
router.put('/disputes/:id', protect, authorize('admin'), updateDispute);
router.post('/disputes/:id/messages', protect, addDisputeMessage);

module.exports = router;
