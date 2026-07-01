const router = require('express').Router();
const { body } = require('express-validator');
const { createLand, getLands, getLandById, updateLand, deleteLand, getMyLands, getAllLands, verifyLand } = require('../controllers/landController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validation');

router.post('/', protect, authorize('owner'), upload.array('images', 10), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('lat').notEmpty().withMessage('Latitude is required'),
  body('lng').notEmpty().withMessage('Longitude is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pricePerHour').isNumeric().withMessage('Price per hour is required'),
], validate, createLand);

router.get('/', getLands);
router.get('/my', protect, authorize('owner'), getMyLands);
router.get('/admin/all', protect, authorize('admin'), getAllLands);
router.get('/:id', getLandById);
router.put('/:id', protect, authorize('owner'), upload.array('images', 10), updateLand);
router.delete('/:id', protect, deleteLand);
router.put('/:id/verify', protect, authorize('admin'), verifyLand);

module.exports = router;
