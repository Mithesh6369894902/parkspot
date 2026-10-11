const router = require('express').Router();
const {
  createSupportTicket,
  getMyTickets,
  getAllTickets,
  addMessageToTicket,
  updateTicketStatus,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createSupportTicket);
router.get('/my', protect, getMyTickets);
router.get('/admin/all', protect, authorize('admin'), getAllTickets);
router.post('/:id/messages', protect, addMessageToTicket);
router.put('/:id/status', protect, authorize('admin'), updateTicketStatus);

module.exports = router;
