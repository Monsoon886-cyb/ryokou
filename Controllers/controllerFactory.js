const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchErrAsync = require('./../utils/catchAsync');

exports.getAll = (Model) =>
  catchErrAsync(async (req, res, next) => {
    //Get Reviews for a tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fieldSelection()
      .pageAndLimit();

    const doc = await features.query;

    //const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchErrAsync(async (req, res, next) => {
    const id = req.params.id;

    let query = Model.findById(id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;
    if (!doc) return next(new AppError('No document with this id found', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchErrAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchErrAsync(async (req, res, next) => {
    const id = req.params.id;

    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No document with this id found', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchErrAsync(async (req, res, next) => {
    const id = req.params.id || req.body.id;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError('No document with this id found', 404));

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });
