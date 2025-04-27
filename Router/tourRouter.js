const express = require('express');
const router = express.Router();
const authController = require('./../Controllers/authController');
const tourController = require('./../Controllers/tourController');
const reviewRouter = require('./reviewRouter');
const bookingsRouter = require('./bookingsRouter');

router.use('/:tourId/reviews', authController.protect, reviewRouter);
router.use('/:tourId/book', authController.protect, bookingsRouter);

router
  .route('/')
  .get(tourController.getAllTour)
  .post(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/top-5-tours')
  .get(tourController.getTopTours, tourController.getAllTour);

router
  .route('/tours-within/:distance/center/:latlng')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .delete(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.uploadTourPhotos,
    tourController.resizeTourPhotos,
    tourController.updateTour
  );

module.exports = router;
