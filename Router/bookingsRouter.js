const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('./../Controllers/authController');
const bookingsController = require('../Controllers/bookingsController');

router
  .route('/')
  .get(authController.protect, bookingsController.getAllBookings)
  .post(bookingsController.createBooking);

module.exports = router;
