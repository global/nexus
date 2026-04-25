const dotenv = require('dotenv');
const mongoose = require('mongoose');

const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : 
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';

dotenv.config({ path: envFile });

// Get the MongoDB connection string from environment variables
const MURL = process.env.DB_CONNECTOR;

// Set custom DNS servers to avoid potential DNS resolution issues
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Connect to MongoDB using Mongoose
async function connectDB() {
    try {
        await mongoose.connect(MURL);

        console.log('MongoDB connected.');
    } catch (err) {
        console.error('Connection error something else:', err);
    }
}

module.exports = connectDB