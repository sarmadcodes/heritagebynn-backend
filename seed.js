const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    let mongoUri = process.env.MONGO_URI.trim();
    if (mongoUri.endsWith('/')) {
      mongoUri = mongoUri.slice(0, -1);
    }
    console.log('Normalized MONGO_URI:', mongoUri);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    } else {
      console.log('Already connected to MongoDB');
    }

    const adminExists = await User.findOne({ email: 'newadmin@example.com' });
    if (adminExists) {
      console.log('Admin user already exists:', adminExists);
      await User.deleteOne({ email: 'newadmin@example.com' });
      console.log('Deleted existing admin user for re-seeding');
    }

    const hashedPassword = await bcrypt.hash('newpassword123', 10);
    console.log('Generated hash:', hashedPassword);
    const adminUser = new User({
      email: 'newadmin@example.com',
      password: hashedPassword,
      role: 'admin',
    });
    await adminUser.save();
    console.log('Admin user created:', adminUser);
  } catch (error) {
    console.error('Error seeding admin:', error.message, error.stack);
    if (error.message.includes('Invalid namespace')) {
      console.error('Check MONGO_URI for extra slashes or invalid DB name');
    }
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedAdmin();
