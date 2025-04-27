const express = require('express');
const path = require('path');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const viewRouter = require('./Router/viewRouter');
const exploreRouter = require('./Router/exploreRouter');
const bookingsRouter = require('./Router/bookingsRouter');
const reviewRouter = require('./Router/reviewRouter');
const tourRouter = require('./Router/tourRouter');
const userRouter = require('./Router/userRouter');
const globalErrorHandler = require('./Controllers/errorController');
const AppError = require('./utils/appError');

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try in an hour',
});
app.use('/api', limiter);

app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());

function xssSanitizer(req, res, next) {
  if (req.body) {
    for (let key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        req.body[key] = xss(req.body[key]);
      }
    }
  }

  if (req.query) {
    for (let key in req.query) {
      if (req.query.hasOwnProperty(key)) {
        req.query[key] = xss(req.query[key]);
      }
    }
  }

  if (req.params) {
    for (let key in req.params) {
      if (req.params.hasOwnProperty(key)) {
        req.params[key] = xss(req.params[key]);
      }
    }
  }

  next();
}
app.use(xssSanitizer);

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdnjs.cloudflare.com https://*.squarecdn.com https://sandbox.web.squarecdn.com;"
  );
  next();
});

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use('/ryok/v1/tsua', tourRouter);
app.use('/ryok/v1/user', userRouter);
app.use('/ryok/v1/review', reviewRouter);
app.use('/ryok/v1/bookings', bookingsRouter);
app.use('/ryok/v1/explore', exploreRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Invalid path ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
