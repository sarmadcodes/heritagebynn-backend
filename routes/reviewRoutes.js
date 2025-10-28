const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your auth middleware
const {
  createReview,
  getReviewsByProduct,
  getAllReviews,
  approveReview,
  replyToReview,
  deleteReview,
} = require('../controllers/reviewController');

// Public: Submit a review (no auth required)
router.post('/:productId', createReview);

// Public: Get approved reviews for a product
router.get('/:productId', getReviewsByProduct);

// Admin: Get all reviews (approved or not)
router.get('/', auth, getAllReviews);

// Admin: Approve a review
router.put('/:id/approve', auth, approveReview);

// Admin: Reply to a review
router.put('/:id/reply', auth, replyToReview);

// Admin: Delete a review
router.delete('/:id', auth, deleteReview);

module.exports = router;
