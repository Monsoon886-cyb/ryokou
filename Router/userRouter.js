const express = require('express');
const router = express.Router();
const authController = require('./../Controllers/authController');
const userController = require('./../Controllers/userController');

router.post('/signup', authController.singUp);
router.post('/login', authController.logIn);
router.get('/logout', authController.logOut);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

//Protected Routes
router.use(authController.protect);

router.patch('/updatepassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateme',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.patch('/deleteme', userController.deleteMe);

//Admininstrator Functions
router.use(authController.restricTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
