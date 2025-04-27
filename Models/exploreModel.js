const mongoose = require('mongoose');

const exploreSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Must have a review'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  },
  images: {
    type: [String],
    required: [true, 'Must have photos'],
  },
});

exploreSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query middleware to populate tour and user data
exploreSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const Explore = mongoose.model('Explore', exploreSchema);

module.exports = Explore;
