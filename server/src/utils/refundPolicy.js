/**
 * Utility to calculate refund amounts based on ParkSpot cancellation policy.
 */
function calculateRefund(booking, cancellationDate = new Date(), isFakeLandReport = false) {
  const totalAmount = booking.totalAmount || 0;

  if (isFakeLandReport) {
    return {
      refundPercentage: 100,
      refundAmount: totalAmount,
      policyApplied: '100% Refund (Fake / Inaccessible Land Guarantee)',
    };
  }

  const startDate = new Date(booking.eventDate.start);
  const hoursUntilStart = (startDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60);

  if (hoursUntilStart >= 24) {
    return {
      refundPercentage: 100,
      refundAmount: totalAmount,
      policyApplied: '100% Full Refund (Cancelled 24+ hours before start)',
    };
  } else if (hoursUntilStart >= 6) {
    const refundAmount = Math.round(totalAmount * 0.75 * 100) / 100;
    return {
      refundPercentage: 75,
      refundAmount,
      policyApplied: '75% Partial Refund (Cancelled 6-24 hours before start)',
    };
  } else {
    const refundAmount = Math.round(totalAmount * 0.50 * 100) / 100;
    return {
      refundPercentage: 50,
      refundAmount,
      policyApplied: '50% Refund (Cancelled less than 6 hours before start)',
    };
  }
}

module.exports = { calculateRefund };
