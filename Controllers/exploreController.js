const catchAsync = require('../utils/catchAsync');
const Explore = require('./../Models/exploreModel');
const factory = require('../Controllers/controllerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhotos = upload.fields([{ name: 'images', maxCount: 3 }]);

exports.resizePhotos = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      const fileName = `public/img/tours/explore/${filename}`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(fileName);

      req.body.images.push(filename);
    })
  );
  next();
});

exports.createExplore = catchAsync(async (req, res, next) => {
  req.body.user = req.body.user || req.user;

  const explore = await Explore.create(req.body);

  //req.ids = explore._id;

  res.status(200).json({
    status: 'success',
    data: {
      explore,
    },
  });
});

exports.addPhotostoExplore = catchAsync(async (req, res) => {
  const id = req.body.id || req.params.id;
  const explore = await Explore.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      explore,
    },
  });
});
