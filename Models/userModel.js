const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator'); //npm validator packages
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'An user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide an email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        //This works only on CREATE and save if we update this for ex with findByIdAndUpdate then this validator wont work
        return el === this.password;
      },
      message: 'Password does not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Encrypting Pass
userSchema.pre('save', async function (nxt) {
  if (!this.isModified('password')) return nxt();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  nxt();
});

//Password changed at
userSchema.pre('save', async function (nxt) {
  if (!this.isModified('password') || this.isNew) return nxt();
  this.passwordChangedAt = Date.now() - 1000;
  nxt();
});

//Querying active users
userSchema.pre(/^find/, function (nxt) {
  this.find({ active: { $ne: false } });
  nxt();
});

//Compare token issued time and pass change time
userSchema.methods.passwordChangeTime = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const intTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return intTime > JWTTimestamp;
  }
  return false;
};

//Comparing Pass
userSchema.methods.confirmPass = async function (originalPass, currentPass) {
  // console.log(originalPass);
  // console.log(await bcrypt.hash(currentPass, 12));
  return await bcrypt.compare(currentPass, originalPass);
};

//Generating password rerset token
userSchema.methods.generatePassResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
