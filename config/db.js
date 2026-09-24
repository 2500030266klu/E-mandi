const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DEFAULT_MONGODB_URI = 'mongodb+srv://admin:Adarsh%40123@cluster0.ulkkg90.mongodb.net/mandidb?appName=Cluster0';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || DEFAULT_MONGODB_URI;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Warning: MongoDB connection issue: ${error.message}`);
    console.log('App will continue running and serve cached/fallback data if MongoDB is reconnecting.');
  }
};

module.exports = connectDB;
