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
      userService.getUserAccount({_id: req.session.user._id})
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
      var userId = req.session.user._id;
      var postBody = {
        name: req.body.fullName,
        phone: req.body.phone,
        drivingLicense: req.body.drivingLicense,
        address: req.body.address,
        email: req.body.email
      };
  
      if (req.body.passwordCurrent  req.body.password  req.body.passwordConfirm) passwordModified = true;
      infoHelper.setPostBody(req, postBody);
  
      userService.getUserAccount({_id: userId})
        .then(function(user) {
          if (passwordModified === true) {
            // confirm password validation
            if (req.body.password !== req.body.passwordConfirm) return res.redirectWithError('/user/edit', 'Password mismatch');
  
            user.comparePassword(req.body.passwordCurrent, function(err, isValid) {
              if (err) {
                console.log(err.stack);
                return res.redirectWithError('/user/edit', 'Something went wrong');
              }
  
              // valid password authentication
              if (isValid !== true) return res.redirectWithError('/user/edit', 'Wrong password is given');
  
              // set password in post body if valid password is provided
              postBody.password = req.body.password;
  
              userService.updateAccount(userId, postBody).then(function(updatedUser) {
                req.session.user = updatedUser;
                return res.redirectWithSuccess('/user/dashboard', 'Account has been updated successfully');
              })
              .catch(function(err) {
                console.log(err.stack);
                return res.redirectWithError('/user/edit', appErrorHelper.populateMongooseErrorMsg(err));
              });
            });
          } else {
            userService.updateAccount(userId, postBody)
              .then(function(updatedUser) {
                req.session.user = updatedUser;
                return res.redirectWithSuccess('/user/dashboard', 'Account has been updated successfully');
              })
              .catch(function(err) {
                console.log(err.stack);
                return res.redirectWithError('/user/edit', appErrorHelper.populateMongooseErrorMsg(err));
              });
          }
        })
        .catch(function(err) {
          console.log(err.stack);
          return res.redirectWithError('/user/edit', err.message);
        });
    },
  
    viewAccount: function(req, res, next) {
      userService.getUserAccount({_id: req.session.user._id})
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