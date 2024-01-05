'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var Promise = require('bluebird');
var rot = require('rot');
var config = require('../config');
var auth = require('../middlewares/auth');
var userService = require('../services/user');
var appErrorHelper = require('../helpers/errors');
var infoHelper = require('../helpers/info');

// route methods
var routes = {
  dashboard: function(req, res, next) {
    res.render('users/dashboard', {
      user: req.session.user
    });
  },

  submitLogout: function(req, res, next) {
    req.session.user = null;
    res.sendOk({
      message: 'Logout successfully',
      path: '/auth/login'
    });
  },

  renderAccountUpdate: function(req, res, next) {
    var username = rot(req.query.username, config.rotShift.dec);
    userService.getUserAccount({username: username})
      .then(function(doc) {
        var postBody = _.first(req.flash('postBody')) || {};
        res.render('users/edit.handlebars', {
          user: {
            name: postBody.name || doc.name,
            username: postBody.username || doc.username,
            email: postBody.email || doc.email,
            phone: postBody.phone || doc.phone,
            drivingLicense: postBody.drivingLicense || doc.drivingLicense,
            address: postBody.address || doc.address,
            username_auth: rot(username, config.rotShift.enc)
          }
        });
      })
      .catch(function(err) {
        console.log(err.stack);
        res.redirectWithError('/user/dashboard', 'User not found');
      });
  },

  submitAccountUpdate: function(req, res, next) {
    var passwordModified = false;
    var usernameEnc = req.body.username_auth;
    var userEditPath = '/user/edit?username=' + usernameEnc;
    var postBody = {
      name: req.body.fullName,
      phone: req.body.phone,
      drivingLicense: req.body.drivingLicense,
      address: req.body.address,
      email: req.body.email
    };
    
    if (req.body.passwordCurrent  req.body.password  req.body.passwordConfirm) passwordModified = true;
    infoHelper.setPostBody(req, postBody);

    userService.getUserAccount({username: rot(usernameEnc, config.rotShift.dec)})
      .then(function(user) {
        if (passwordModified === true) {
          // confirm password validation
          if (req.body.password !== req.body.passwordConfirm) return res.redirectWithError(userEditPath, 'Password mismatch');

          user.comparePassword(req.body.passwordCurrent, function(err, isValid) {
            if (err) {
              console.log(err.stack);
              return res.redirectWithError(userEditPath, 'Something went wrong');
            }

            // valid password authentication
            if (isValid !== true) return res.redirectWithError(userEditPath, 'Wrong password is given');

            // set password in post body if valid password is provided
            postBody.password = req.body.password;

            userService.updateAccount(user._id, postBody).then(function(updatedUser) {
              updatedUser.usernameEnc = rot(updatedUser.username, config.rotShift.enc);
              req.session.user = updatedUser;
              return res.redirectWithSuccess('/user/dashboard', 'Account has been updated successfully');
            })
            .catch(function(err) {
              console.log(err.stack);
              return res.redirectWithError(userEditPath, appErrorHelper.populateMongooseErrorMsg(err));
            });
          });
        } else {
          userService.updateAccount(user._id, postBody)
            .then(function(updatedUser) {
              updatedUser.usernameEnc = rot(updatedUser.username, config.rotShift.enc);
              req.session.user = updatedUser;
              return res.redirectWithSuccess('/user/dashboard', 'Account has been updated successfully');
              })
            .catch(function(err) {
              console.log(err.stack);
              return res.redirectWithError(userEditPath, appErrorHelper.populateMongooseErrorMsg(err));
            });
        }
      })
      .catch(function(err) {
        console.log(err.stack);
        return res.redirectWithError(userEditPath, err.message);
      });
  },

  viewAccount: function(req, res, next) {
    var username = rot(req.query.username, config.rotShift.dec);
    userService.getUserAccount({username: username})
      .then(function(user) {
        res.render('users/account', {
          user: _.pick(user, ['name', 'username', 'email', 'address', 'phone', 'drivingLicense'])
        });
      })
      .catch(function(err) {
        console.log(err.stack);
        res.redirectWithError('/user/dashboard', 'Something went wrong');
      });
  }
};

// routes
router.get('/dashboard', routes.dashboard);
router.post('/logout', routes.submitLogout);
router.get('/account', routes.viewAccount);
router.get('/edit', routes.renderAccountUpdate);
router.put('/', routes.submitAccountUpdate);

module.exports = router;