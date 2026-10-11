const assert = require('assert');
const { calculateRefund } = require('./utils/refundPolicy');

console.log('--- Testing ParkSpot Refund Policy Logic ---');

// Test 1: Fake Land Claim -> 100% Refund
const bookingFake = { totalAmount: 1000, eventDate: { start: new Date(Date.now() + 10000) } };
const refundFake = calculateRefund(bookingFake, new Date(), true);
console.log('Test 1 (Fake Land):', refundFake);
assert.strictEqual(refundFake.refundPercentage, 100);
assert.strictEqual(refundFake.refundAmount, 1000);

// Test 2: > 24 Hours Cancellation -> 100% Refund
const now = new Date('2026-08-13T10:00:00Z');
const start28h = new Date('2026-08-14T14:00:00Z'); // 28 hours later
const booking24h = { totalAmount: 1200, eventDate: { start: start28h } };
const refund24h = calculateRefund(booking24h, now, false);
console.log('Test 2 (>24 Hours):', refund24h);
assert.strictEqual(refund24h.refundPercentage, 100);
assert.strictEqual(refund24h.refundAmount, 1200);

// Test 3: 6-24 Hours Cancellation -> 75% Refund
const start12h = new Date('2026-08-13T22:00:00Z'); // 12 hours later
const booking12h = { totalAmount: 1000, eventDate: { start: start12h } };
const refund12h = calculateRefund(booking12h, now, false);
console.log('Test 3 (6-24 Hours):', refund12h);
assert.strictEqual(refund12h.refundPercentage, 75);
assert.strictEqual(refund12h.refundAmount, 750);

// Test 4: < 6 Hours Cancellation -> 50% Refund
const start2h = new Date('2026-08-13T12:00:00Z'); // 2 hours later
const booking2h = { totalAmount: 800, eventDate: { start: start2h } };
const refund2h = calculateRefund(booking2h, now, false);
console.log('Test 4 (<6 Hours):', refund2h);
assert.strictEqual(refund2h.refundPercentage, 50);
assert.strictEqual(refund2h.refundAmount, 400);

console.log('✅ ALL REFUND POLICY TESTS PASSED SUCCESSFULLY!');
