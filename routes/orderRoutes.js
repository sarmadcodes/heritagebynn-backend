const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');

// Multer setup for file uploads                                   
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `payment-  screenshot-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order (for CheckoutPage.tsx)
router.post('/', upload.single('paymentScreenshot'), async (req, res) => {
  const { items, customer, subtotal, shipping, total, paymentMethod } = req.body;
  try {
    const orderData = {
      items: JSON.parse(items),
      customer: JSON.parse(customer),
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      total: Number(total),
      paymentMethod,
      status: 'Pending',
      paymentScreenshot: req.file ? req.file.path.replace(/^Uploads[\\/]/, '') : undefined
    };
    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Update order status
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.paymentScreenshot) {
      await fs.unlink(path.join(__dirname, '..', 'Uploads', order.paymentScreenshot)).catch(err => {
        console.error('Failed to delete screenshot:', err);
      });
    }
    res.status(200).json({ message: 'Order deleted successfully', order });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

module.exports = router;
