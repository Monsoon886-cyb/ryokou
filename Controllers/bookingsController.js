const factory = require('./controllerFactory');
const Bookings = require('../Models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const User = require('../Models/userModel');
const Tour = require('../Models/tourModel');

exports.createBooking = catchAsync(async (req, res, next) => {
  const tourId = req.params.tourId || req.body.tour;
  const userId = req.user.id || req.body.user;

  const user = await User.findById(userId);
  const tour = await Tour.findById(tourId);

  if (!user) {
    return next(new AppError('No User found', 400));
  }
  if (!tour) return next(new AppError('No tour found', 400));

  const payId = `${tourId}-${userId}-${Date.now()}`;

  const bookings = await Bookings.create({
    tour: tourId,
    user: userId,
    price: req.body.price,
    paymentId: payId,
    passengers: req.body.passengers,
    passengerNum: req.body.passengerNum,
  });

  const url = `${req.protocol}://${req.get('host')}/tours`;
  await new Email(user, url, bookings, tour).sendBooked();

  await res.status(200).json({
    status: 'success',
    data: {
      bookings,
    },
  });
});

exports.getBooking = factory.getOne(Bookings);
exports.getAllBookings = factory.getAll(Bookings);
exports.updateBooking = factory.updateOne(Bookings);
exports.deleteBooking = factory.deleteOne(Bookings);
