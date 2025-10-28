require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const statsRoutes = require('./routes/statsRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // Add this
const path = require('path');
const fs = require('fs').promises;

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
}));
app.use(express.json());
// Serve uploads folder
app.use('/uploads', async (req, res, next) => {
  const filePath = path.join(__dirname, 'Uploads', req.path.substring(1));
  try {
    await fs.access(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    res.set({
      'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
    });
    res.sendFile(filePath);
  } catch (err) {
    console.error(`Error serving file ${filePath}:`, err);
    res.status(404).json({ message: 'File not found' });
  }
});

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' blob: http://localhost:5004/uploads/*; script-src 'self' 'unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'"
  );
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/contacts', contactRoutes);
app.use('/stats', statsRoutes);
app.use('/reviews', reviewRoutes); // Add this

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
      console.log(`Static files at http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

startServer();
