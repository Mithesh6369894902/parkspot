function calculatePrice(basePrice, dynamicPricing, startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
  let multiplier = 1;

  const day = start.getDay();
  const hour = start.getHours();
  const isWeekend = day === 0 || day === 6;
  const isPeakHour = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21);

  if (isPeakHour) multiplier = Math.max(multiplier, dynamicPricing.peakMultiplier || 1.5);
  if (isWeekend) multiplier = Math.max(multiplier, dynamicPricing.weekendMultiplier || 1.3);

  return {
    hours,
    basePrice,
    multiplier,
    totalPerHour: Math.round(basePrice * multiplier),
    totalAmount: Math.round(basePrice * multiplier * hours),
    isPeakHour,
    isWeekend,
  };
}

module.exports = { calculatePrice };
