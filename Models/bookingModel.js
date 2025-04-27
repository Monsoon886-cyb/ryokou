const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
  paymentId: {
    type: String,
    required: [true, 'Booking must have a payment ID'],
    default: 'Booked',
  },
  passengers: {
    type: [String],
    required: [true, 'Booking must have the name of the Client'],
  },
  passengerNum: {
    type: Number,
    required: [true, 'Number of passengers must be defined.'],
  },
  refunded: {
    type: Boolean,
    default: false,
  },
  refundId: {
    type: String,
  },
});

// Query middleware to populate tour and user data
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email',
  }).populate({
    path: 'tour',
    select: 'name imageCover startDates duration description',
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
