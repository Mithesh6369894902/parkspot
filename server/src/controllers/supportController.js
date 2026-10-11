const Dispute = require('../models/Dispute');

// Create a new support ticket / dispute
exports.createSupportTicket = async (req, res) => {
  try {
    const { type, subject, description, contactPhone, bookingId, reportedUserId, priority } = req.body;

    const ticket = await Dispute.create({
      reporter: req.user.id,
      reportedUser: reportedUserId || undefined,
      booking: bookingId || undefined,
      type: type || 'other',
      priority: priority || (type === 'fake_land' ? 'critical' : 'medium'),
      subject: subject || `${type ? type.toUpperCase() : 'SUPPORT'} Ticket`,
      description,
      contactPhone: contactPhone || '',
      status: 'open',
    });

    res.status(201).json({ message: 'Support ticket created successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tickets for logged-in user
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Dispute.find({ reporter: req.user.id })
      .populate('booking', 'eventDate totalAmount status')
      .populate('reportedUser', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all support tickets
exports.getAllTickets = async (req, res) => {
  try {
    const { status, type, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const tickets = await Dispute.find(filter)
      .populate('reporter', 'name email phone')
      .populate('reportedUser', 'name email phone')
      .populate('booking', 'eventDate totalAmount status')
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a reply message to a support ticket
exports.addMessageToTicket = async (req, res) => {
  try {
    const ticket = await Dispute.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Support ticket not found' });

    // Check authorization: reporter, reported user, or admin
    if (ticket.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    ticket.messages.push({
      sender: req.user.id,
      message: req.body.message,
      createdAt: new Date(),
    });

    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'investigating';
    }

    await ticket.save();
    res.json({ message: 'Reply added successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Resolve / update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, resolution, priority } = req.body;
    const ticket = await Dispute.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Support ticket not found' });

    if (status) ticket.status = status;
    if (resolution !== undefined) ticket.resolution = resolution;
    if (priority) ticket.priority = priority;

    await ticket.save();
    res.json({ message: 'Support ticket updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
