const Review = require('../models/Review');
const Product = require('../models/Product'); // Ensure you have a Product model

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { name, rating, text, occasion, image } = req.body;
    const { productId } = req.params;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = new Review({
      productId,
      name,
      rating,
      text,
      occasion,
      image,
      approved: false, // Default to pending approval
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted, pending approval' });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get approved reviews for a product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, approved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews (admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a review (admin only)
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review approved', review });
  } catch (err) {
    console.error('Error approving review:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reply to a review (admin only)
exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const review = await Review.findByIdAndUpdate(
      id,
      { reply },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Reply added', review });
  } catch (err) {
    console.error('Error replying to review:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review (admin only)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
