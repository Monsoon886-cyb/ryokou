const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const Review = require('./../Models/reviewModel');
const factory = require('./controllerFactory');

exports.getAllReviewsfromUser = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id });
  if (!reviews) return next(new AppError('No reviews found'), 400);

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.setUserAndTourToReviewBody = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
