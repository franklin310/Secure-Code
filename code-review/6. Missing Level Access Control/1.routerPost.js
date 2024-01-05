var express = require('express');
var router = express.Router();
var login = require('../model/login');
var users = require('../model/users');
var constant = require('../model/constant');
var auth = require('../model/auth');
var reactor = require('../model/reactor');
const {
  execFile
} = require('child_process');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {
  login.authenticate(req.body.username, req.body.password, function(status, userInfo) {
    if (status == constant.success) {
      users.resetFailureAttempt(req.body.username);
      req.session.username = req.body.username;
      res.send({
        responseStatus: "Success"
      });
    } else if (status == constant.locked) {
      res.send({
        responseStatus: "Locked",
        responseMessage: "Your account has been locked. Please contact admin."
      });
    } else if (status == constant.reject) {
      users.updateFailureAttempt(req.body.username);
      users.updateLockStatus(req.body.username);
      res.send({
        responseStatus: "Reject",
        responseMessage: "You entered an incorrect username or password. On three failed attempts your account will be locked."
      });
    } else {
      res.send({
        responseStatus: "Error",
        responseMessage: "Something went wrong."
      });
    }
  });

});

router.post('/getReactors', auth.authenticationCheck, function(req, res, next) {
  reactor.getReactors(function(result) {
    res.json(result);
  });

});

router.post('/getReactorStatus', auth.authenticationCheck, function(req, res, next) {
  reactor.getReactorStatus(req.body.reactorId, function(status) {
    res.json({
      status: constant.status.getReactorStatusById(status)
    });
  });
});

router.post('/updateReactorStatus', function(req, res, next) {
  if (req.body.cmdId && req.body.reactorId) {
    reactor.validateReactorId(req.body.reactorId, function(status) {
      if (status === constant.reject) {
        return res.status(400).send({
          status: constant.reject
        });
      }
    });
    execFile('resources/reactorControl.exe', [req.body.reactorId, constant.command.getCommandNameById(req.body.cmdId)], function(err, stdout, stderr) {
      if (err !== null) {
        console.log(err);
      }
    });
  } else {
    res.status(400).send({
      status: constant.reject
    });
  }
  reactor.updateReactorStatus(req.body.cmdId, req.body.reactorId, function(status) {
    res.json({
      status: status
    });
  });
});

router.get('/logout', function(req, res, next) {
  //code for invalidate session
  req.session.destroy(function(err) {
    if (err) return next(err);
  });
  res.send({
    responseStatus: "Success"
  });
});

router.post('/resetPassword', function(req, res, next) {
  //This is the implementation Reset password.
  res.send({
    responseStatus: "Success",
    responseMessage: "Password reset link has been sent to your email address."
  });
});

module.exports = router;