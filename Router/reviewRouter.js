const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('./../Controllers/reviewController');
const authController = require('./../Controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restricTo('user'),
    reviewController.setUserAndTourToReviewBody,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router.get('/userreviews', reviewController.getAllReviewsfromUser);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restricTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restricTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
