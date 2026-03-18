const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@parknow.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@parknow.com',
        password: 'password123',
        role: 'admin',
      });
      console.log('Admin user created: admin@parknow.com / password123');
    }

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'user@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
    } else {
      await User.create({
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
      });
      console.log('Test user created: user@example.com / password123');
    }

    await mongoose.disconnect();
    console.log('Done! You can now login with these credentials.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
