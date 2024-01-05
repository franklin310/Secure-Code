const { Schema, model } = require('mongoose');
const { hash, verify } = require('argon2');
const CryptoService = require('../services/crypto.service');
const { NotFound } = require('../models/app-error');
const { MESSAGES } = require('../constants');

const roles = {
  USER: 'user',
  ADMIN: 'admin',
};

const userModel = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },

  role: {
    type: String,
    enum: Object.values(roles),
    default: roles.USER,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: false,
  },

  address: {
    type: String,
    required: false,
  },

  password: {
    type: String,
    required: true,
  },

  tokens: [String],

  recoveryToken: String,

  avatar: {
    type: String,
    maxlength: 250,
  },

  cart: {
    courses: [
      {
        count: {
          type: Number,
          required: true,
          default: 1,
        },
        course: {
          type: Schema.Types.ObjectId,
          ref: 'CourseModel',
        },
      },
    ],
  },
});

userModel.statics.getVerifyUser = async function(email, password = '') {
  const user = (await this.findOne({ email })) || {};

  const verifyPassword = await verify(
    user.password || String(Math.random()),
    password,
  );

  if (verifyPassword) {
    return user;
  }

  throw new NotFound(MESSAGES.USER.NOT_EXISTS);
};

userModel.statics.getUserByRecoveryToken = async function(recoveryToken) {
  const user = await this.findOne({ recoveryToken });

  if (user) return user;

  throw new NotFound(MESSAGES.USER.NOT_EXISTS);
};

userModel.methods.saveToken = async function(token) {
  this.tokens.push(token);
  await this.save();

  return this;
};

userModel.methods.removeToken = async function(token) {
  this.tokens = this.tokens.filter(innerToken => innerToken !== token);
  await this.save();

  return this;
};

userModel.methods.clearCart = async function() {
  this.cart.courses = [];
  await this.save();

  return this;
};

userModel.methods.saveWithHashPassword = async function() {
  this.password = await hash(this.password);
  await this.save();

  return this;
};

userModel.methods.encryptAndSaveData = async function() {
  this.phone = CryptoService.encrypt(this.phone);
  this.address = CryptoService.encrypt(this.address);
  await this.save();

  return this;
};

userModel.methods.decryptData = async function() {
  this.phone = CryptoService.decrypt(this.phone);
  this.address = CryptoService.decrypt(this.address);

  return this;
};

module.exports = {
  UserModel: model('UserModel', userModel),
  roles,
};