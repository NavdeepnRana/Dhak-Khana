const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log('🗄️  MongoDB connected');
  } catch (error) {
    console.error('Mongo connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;

