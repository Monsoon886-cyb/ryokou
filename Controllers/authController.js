const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const Email = require('./../utils/email');
const User = require('./../Models/userModel');
const AppError = require('./../utils/appError');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};

//Sending response with tokens through cookies
const sendCreateToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOPtions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOPtions.secure = true;

  res.cookie('jwt', token, cookieOPtions);

  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('Access denied! You cannot perform this operation', 403)
      );
    next();
  };
};

exports.singUp = catchAsync(async (req, res, next) => {
  // Check if passwords match first
  if (req.body.password !== req.body.passwordConfirm) {
    return next(
      new AppError('Password and confirm password do not match', 400)
    );
  }
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    //role: req.body.role, // error
    photo: req.body.photo,
  });

  const url = `${req.protocol}://${req.get('host')}/tours`;

  await new Email(user, url).sendWelcome();
  //Send res
  sendCreateToken(user, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  //User crendentials
  const { email, password } = req.body;
  const userExists = await User.exists({ email });

  if (!userExists)
    return next(new AppError('User with this email does not exists', 404));

  if (!email || !password)
    return next(new AppError('Enter your email and password', 400));

  //Check user
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.confirmPass(user.password, password)))
    return next(new AppError('Email or password is not correct', 401));

  //Send res
  sendCreateToken(user, 200, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //JWT exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('You are logged out! Please log in to continue', 401)
    );

  //JWT Verification
  const verified = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRETKEY
  );

  //User still exists
  const checkUser = await User.findById(verified.id);
  if (!checkUser)
    return next(new AppError('User does not exists! Please Sign up', 401));

  //Pass changed after log in
  if (checkUser.passwordChangeTime(verified.iat))
    return next(
      new AppError(
        'User recently changed the password! Please log in again',
        401
      )
    );

  req.user = checkUser;
  res.locals.user = checkUser;

  next();
});

exports.checkLoggedIn = catchAsync(async (req, res, next) => {
  try {
    // 1) Check if there is a token
    if (!req.cookies.jwt || req.cookies.jwt === 'loggedout') {
      return next();
    }

    // 2) Verify the token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRETKEY
    );

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.passwordChangeTime(decoded.iat)) {
      return next();
    }

    // User is logged in
    res.locals.user = currentUser;
    return next();
  } catch (err) {
    return next();
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Check for User
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(
        'User with this email does not exists. Please enter a valid email id',
        404
      )
    );
  //Generate reset token
  const resetToken = user.generatePassResetToken();
  await user.save({ validateBeforeSave: false });

  //Send mail
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token has been send to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the mail. Please try again!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Finding user
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  //Updating user creds
  (user.password = req.body.password),
    (user.passwordConfirm = req.body.passwordConfirm),
    (user.passwordResetToken = undefined),
    (user.passwordResetExpires = undefined);
  await user.save();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get User
  const { currentPassword, password, passwordConfirm } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  //Check pass and confirm pass
  const passConfirm = await user.confirmPass(user.password, currentPassword);
  if (!passConfirm)
    return next(
      new AppError('Invalid password. Please enter your current password', 404)
    );

  //Update data
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  //Log user in (send jwt)
  sendCreateToken(user, 200, res);
});
