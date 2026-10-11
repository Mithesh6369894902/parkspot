const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').isLength({ max: 128 }).withMessage('Password too long'),
  body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^[+]?[0-9\s-]{10,15}$/).withMessage('Valid phone is required'),
  body('role').optional().isIn(['customer', 'owner']).withMessage('Role must be customer or owner'),
], validate, register);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
