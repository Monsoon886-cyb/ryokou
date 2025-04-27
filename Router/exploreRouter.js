const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const exploreController = require('../Controllers/exploreController');

router
  .route('/')
  .post(
    authController.protect,
    authController.restricTo('user'),
    exploreController.createExplore
  );
router
  .route('/add/:id')
  .patch(
    authController.protect,
    authController.restricTo('user'),
    exploreController.uploadPhotos,
    exploreController.resizePhotos,
    exploreController.addPhotostoExplore
  );

module.exports = router;
