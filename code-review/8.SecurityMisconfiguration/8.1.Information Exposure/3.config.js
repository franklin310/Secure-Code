var express = require('express');
var router = express.Router();
var auth = require('../model/auth');
var constant = require('../model/constant');
var expenseGroup = require('../model/expenseGroup');
var log = require('../model/log');
var config = require('../config/env/config_' + process.env.NODE_ENV);

/* GET home page. */
router.get('/', auth.authenticationCheck, function(req, res, next) {
  res.redirect("/dashboard");
});

router.get('/dashboard', auth.authenticationCheck, function(req, res, next) {
  expenseGroup.getExpensesCategory(req.session.user.username, function(result) {
    let expenseObject = {};
    if (result.length > 0) {
      expenseObject = result[0];
    }
    expenseObject.username = req.session.user.username;
    return res.render('../views/dashboard.html', expenseObject);
  })
});

router.get('/config', function(req, res, next) {
  res.render('../views/showInfo.html', {
    serverInfo: {
      host: config.host,
      port: config.port,
      log: config.logConfig
    }
  });
});

router.get('/expenseManagement', auth.isAdminAuthenticated, function(req, res, next) {
  res.render('../views/expenseManagement.html', constant.getJSPathByReq(req.query.type));
});

router.get('/getSendEmailPage', auth.isAdminAuthenticated, function(req, res, next) {
  res.render('../views/sendEmail.html', {
    userEmail: req.query.email
  });
});

module.exports = router;