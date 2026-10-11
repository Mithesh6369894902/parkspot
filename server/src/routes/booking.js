const router = require('express').Router();
const { body } = require('express-validator');
const { createBooking, getMyBookings, getLandBookings, getBookingById, cancelBooking, updateBookingStatus, checkAvailability, reportFakeLand, calculatePreview } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

router.post('/', protect, [
  body('landId').custom((v, { req }) => (v || req.body.land || req.body.land_id) ? true : Promise.reject('landId is required')),
  body('vehicleType').isIn(['two_wheeler', 'four_wheeler', 'mixed']).withMessage('Invalid vehicleType'),
  body('vehicleCount').custom((v) => (parseInt(v, 10) >= 1 && parseInt(v, 10) <= 500) ? true : Promise.reject('vehicleCount must be 1-500')),
], validate, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/land/:landId', protect, getLandBookings);
router.get('/availability', checkAvailability);
router.post('/calculate', calculatePreview);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/report-fake', protect, reportFakeLand);
router.put('/:id/status', protect, authorize('admin', 'owner'), updateBookingStatus);

module.exports = router;
