const crypto = require('crypto');

console.log('====================================================');
console.log(' 💳 PARKSPOT - RAZORPAY BACKEND SAMPLE PAYMENT DEMO');
console.log('====================================================');

// 1. Simulate Booking Details
const mockBooking = {
  _id: '66bc1a2b8e4f1234567890ab',
  customer: '66bc1a2b8e4f123456789000',
  landTitle: 'Chennai Central Event Parking Ground',
  durationHours: 4,
  totalAmount: 400, // ₹400
  status: 'pending',
};

console.log('\n--- 1. CUSTOMER CREATES BOOKING ---');
console.log(`Booking ID : ${mockBooking._id}`);
console.log(`Land Title : ${mockBooking.landTitle}`);
console.log(`Duration   : ${mockBooking.durationHours} Hours`);
console.log(`Total      : ₹${mockBooking.totalAmount}`);
console.log(`Status     : ${mockBooking.status}`);

// 2. Simulate POST /api/payments/create-order
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sample';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'sample_secret_key_123';

const orderId = `order_demo_${Date.now()}`;
const amountInPaise = mockBooking.totalAmount * 100; // 40000 paise

const mockOrderResponse = {
  id: orderId,
  entity: 'order',
  amount: amountInPaise,
  amount_paid: 0,
  amount_due: amountInPaise,
  currency: 'INR',
  receipt: `booking_${mockBooking._id}`,
  status: 'created',
  created_at: Math.floor(Date.now() / 1000),
  key: razorpayKeyId,
};

console.log('\n--- 2. CALL: POST /api/payments/create-order ---');
console.log('Backend creates order with Razorpay Gateway API:');
console.log(JSON.stringify(mockOrderResponse, null, 2));

// 3. Simulate Razorpay Checkout (User pays via UPI / GPay / Card)
const razorpayPaymentId = `pay_demo_${Date.now()}`;

// Generate valid HMAC SHA256 Signature as Razorpay Gateway does
const signatureData = orderId + '|' + razorpayPaymentId;
const razorpaySignature = crypto
  .createHmac('sha256', razorpayKeySecret)
  .update(signatureData)
  .digest('hex');

console.log('\n--- 3. USER COMPLETES PAYMENT ON RAZORPAY POPUP ---');
console.log(`Razorpay Order ID   : ${orderId}`);
console.log(`Razorpay Payment ID : ${razorpayPaymentId}`);
console.log(`Razorpay Signature  : ${razorpaySignature}`);

// 4. Simulate POST /api/payments/verify
const expectedSignature = crypto
  .createHmac('sha256', razorpayKeySecret)
  .update(orderId + '|' + razorpayPaymentId)
  .digest('hex');

const isVerified = expectedSignature === razorpaySignature;

console.log('\n--- 4. CALL: POST /api/payments/verify ---');
console.log(`HMAC SHA256 Verification Result : ${isVerified ? 'SUCCESS ✅' : 'FAILED ❌'}`);

if (isVerified) {
  mockBooking.status = 'confirmed';
  const paymentRecord = {
    paymentId: `PAY_DB_${Date.now()}`,
    bookingId: mockBooking._id,
    razorpayOrderId: orderId,
    razorpayPaymentId: razorpayPaymentId,
    razorpaySignature: razorpaySignature,
    amount: mockBooking.totalAmount,
    currency: 'INR',
    method: 'upi_gpay',
    status: 'captured',
    paidAt: new Date().toISOString(),
  };

  console.log('\nPayment Record Saved in Database:');
  console.log(JSON.stringify(paymentRecord, null, 2));

  console.log(`\nUpdated Booking Status in Database: ${mockBooking.status.toUpperCase()}`);
}

console.log('\n====================================================');
console.log(' 🎉 SAMPLE RAZORPAY PAYMENT FLOW PASSED SUCCESSFULLY!');
console.log('====================================================');
