const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');
const HttpError = require('../models/http-error');

const cryptPassword = password => Buffer.from(password).toString('base64');

const UserSchema = new Schema({
  login: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
}, { versionKey: false });

UserSchema.pre('save', async function (next) {
  this.password = cryptPassword(this.password);
  next();
});

UserSchema.static('validateUser', async function (login, password) {
  const user = await this.findOne({ login });
  return user.password === cryptPassword(password) ? user : null;
});

UserSchema.static('changePassword',
  async function (login, password, newPassword) {
    const user = await this.validateUser(login, password);

    if (!user) { throw new HttpError(403, 'Invalid old password'); }

    user.password = newPassword;
    user.save();
    return user.generateJWT();
  });

UserSchema.methods.generateJWT = function () {
  return jwt.sign({
    login: this.login,
    id: this._id,
  }, config.server.secret, { expiresIn: config.server.expiresIn });
};

module.exports = model('User', UserSchema);