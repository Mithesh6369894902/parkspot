const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('');
    console.error('=== MongoDB Setup Required ===');
    console.error('');
    console.error('Option 1 - MongoDB Atlas (FREE, recommended):');
    console.error('  1. Go to https://www.mongodb.com/atlas');
    console.error('  2. Create free account and M0 cluster');
    console.error('  3. Get connection string and update server/.env');
    console.error('');
    console.error('Option 2 - Local MongoDB:');
    console.error('  1. Download from https://www.mongodb.com/try/download/community');
    console.error('  2. Install and start the service');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;
