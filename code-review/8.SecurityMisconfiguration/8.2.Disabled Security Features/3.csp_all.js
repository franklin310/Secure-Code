var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var index = require('./routes/index');
var users = require('./routes/users');
var uid = require('uid-safe').sync;
var cons = require('consolidate');
var config = require('./config/env/config_' + process.env.NODE_ENV);
var expressValidator = require('express-validator');
var app = express();
var helmet = require('helmet');
// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

config.sessionConfig.genid = function(req) {
  return uid(24);
};
app.use(session(config.sessionConfig));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// use helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'*'"],
      styleSrc: ["'*'"],
      imgSrc: ["'*'"],
      scriptSrc: ["'*'"]
    }
  }
}));
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;