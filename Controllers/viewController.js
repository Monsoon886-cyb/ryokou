const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../Models/tourModel');
const Bookings = require('../Models/bookingModel');
const Review = require('./../Models/reviewModel');
const Explore = require('./../Models/exploreModel');

exports.goHome = (req, res) => {
  res.status(200).render('home', {});
};

exports.getTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
};

exports.getSignupPage = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup to your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'My Account',
    user: req.user,
  });
};

exports.getForgotPass = (req, res) => {
  res.status(200).render('forgotPass', {
    title: 'Forgot Password',
  });
};

exports.getResetPass = (req, res) => {
  res.status(200).render('resetPass', {
    title: 'Reset Password',
  });
};

exports.getBookingPage = catchAsync(async (req, res, next) => {
  // Get the tour data from the database based on the tourId
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('There is no tour with that ID', 404));
  }

  res.status(200).render('booking', {
    title: `Book ${tour.name}`,
    tour,
    user: req.user,
  });
});

exports.getBillingsPage = catchAsync(async (req, res, next) => {
  const bookings = await Bookings.find({ user: req.user.id }).sort(
    '-createdAt'
  );

  res.status(200).render('billing', {
    title: `Billings`,
    bookings,
  });
});

exports.getJourneyPage = catchAsync(async (req, res, next) => {
  const bookings = await Bookings.find({ user: req.user.id });
  const allTours = await Tour.find();

  const tourIds = bookings.map((booking) => booking.tour.id);
  const tours = allTours.filter((tour) => tourIds.includes(tour.id));

  res.status(200).render('overview2', {
    title: 'My Journeys',
    tours,
  });
});

exports.getBookedTourDetails = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) return next(new AppError('There is no tour with that name', 400));

  res.status(200).render('bookedtours', {
    title: 'My Tours',
    tour,
    user: req.user,
  });
});

exports.getUserReviewPage = catchAsync(async (req, res) => {
  const reviews = await Review.find({ user: req.user.id });
  res.status(200).render('userReviews', {
    title: 'My Reviews',
    reviews,
    user: req.user,
  });
});

exports.getExplorePage = catchAsync(async (req, res) => {
  const explores = await Explore.find({ tour: req.params.tourId }).sort(
    '-createdAt'
  );
  res.status(200).render('explore', {
    title: 'Share your Experiences',
    explores,
    tourId: req.params.tourId,
    user: req.user,
  });
});
