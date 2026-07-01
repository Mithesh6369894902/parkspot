// Notification utility
// Ready for WebSocket/Push notification integration

function sendNotification(userId, type, data) {
  console.log(`[Notification] User: ${userId}, Type: ${type}`, data);
  return true;
}

function notifyBookingConfirmed(booking) {
  sendNotification(booking.customer, 'booking_confirmed', {
    bookingId: booking._id,
    message: `Your booking has been confirmed!`,
  });
}

function notifyNewBooking(booking) {
  sendNotification(booking.land?.owner, 'new_booking', {
    bookingId: booking._id,
    message: `New booking received for your land!`,
  });
}

function notifyPaymentReceived(payment) {
  sendNotification(payment.user, 'payment_received', {
    paymentId: payment._id,
    amount: payment.amount,
    message: `Payment of Rs.${payment.amount} received successfully!`,
  });
}

module.exports = { sendNotification, notifyBookingConfirmed, notifyNewBooking, notifyPaymentReceived };
