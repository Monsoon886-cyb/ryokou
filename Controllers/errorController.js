const AppError = require('./../utils/appError');

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again', 401);
};

const handleJWTMalformedError = () => {
  return new AppError('Invalid login session. Please log in again', 401);
};

const handleExpiredToken = () => {
  return new AppError('Token expired. Please log in again', 401);
};

const handleCasteError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  console.log(err.keyValue.name);
  const message = `Duplicate field value ${err.keyValue.name}. Please enter another value`;
  return new AppError(message, 400);
};

const handleValidators = (err) => {
  const errMessage = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errMessage.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrDev = (err, req, res) => {
  console.log(err);
  if (req.originalUrl.startsWith('/ryok')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  console.error('ERROR 💥', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
    error: err,
  });
};

const sendErrorProd = (err, req, res) => {
  console.log(err);
  if (req.originalUrl.startsWith('/ryok')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  } else {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
    }
    return res.status(500).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCasteError(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'ValidationError') error = handleValidators(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleExpiredToken();
    if (error.message && error.message.includes('jwt malformed'))
      error = handleJWTMalformedError();

    sendErrorProd(error, req, res);
  }
  next();
};
