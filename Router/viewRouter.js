const express = require('express');
const router = express.Router();
const authController = require('./../Controllers/authController');
const viewController = require('./../Controllers/viewController');

router.get('/', authController.checkLoggedIn, viewController.goHome);
router.get('/tours', authController.checkLoggedIn, viewController.getTours);
router.get('/tours/:slug', authController.protect, viewController.getTour);
router.get('/login', authController.checkLoggedIn, viewController.getLoginPage);
router.get('/itsme', authController.protect, viewController.getAccount);
router.get('/forgotPassword', viewController.getForgotPass);
router.get('/resetPassword/:resetToken', viewController.getResetPass);
router.get(
  '/signup',
  authController.checkLoggedIn,
  viewController.getSignupPage
);
router.get(
  '/getBillings',
  authController.protect,
  viewController.getBillingsPage
);
router.get(
  '/myjourneys',
  authController.protect,
  viewController.getJourneyPage
);
router.get(
  '/tours/:slug/booked',
  authController.protect,
  viewController.getBookedTourDetails
);
router.get(
  '/tour/:tourId/book',
  authController.protect,
  viewController.getBookingPage
);
router.get(
  '/myreviews',
  authController.protect,
  viewController.getUserReviewPage
);
router.get(
  '/explore/:tourId',
  authController.protect,
  viewController.getExplorePage
);

module.exports = router;
