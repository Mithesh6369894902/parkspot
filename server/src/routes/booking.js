const router = require('express').Router();
const { createBooking, getMyBookings, getLandBookings, getBookingById, cancelBooking, updateBookingStatus, checkAvailability } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/land/:landId', protect, getLandBookings);
router.get('/availability', checkAvailability);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, authorize('admin', 'owner'), updateBookingStatus);

module.exports = router;
