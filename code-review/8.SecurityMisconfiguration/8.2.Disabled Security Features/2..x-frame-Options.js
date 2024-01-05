'use strict';

var config = require('./config');
var express = require('express');
var app = express();
var morgan = require('morgan');
var fs = require('fs');
var server = require('https').createServer({key: fs.readFileSync(config.keyPath), cert: fs.readFileSync(config.certPath)}, app);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var csrf = require('csurf');
var helmet = require('helmet');
var flash = require('connect-flash');
var exphbs = require('express-handlebars');
var infoHelper = require('./helpers/info');

var router = express.Router();
var PORT = process.env.PORT  config.port  3004;

// handlebars helpers
var hbs = exphbs.create({
  defaultLayout: 'base'
});

// enable logger
app.use(morgan((process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development') ? 'dev' : 'common'));

// set view path and engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// set staic file loction
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// parse application/json
app.use(bodyParser.json());

// configure method-override for all request methods
app.use(methodOverride('_method'));

// set cookie parser
app.use(cookieParser(config.sessionConfig.secret));

// configure session store
config.sessionConfig.cookie.expires = new Date(Date.now() + 60 * 60  * 1000);
app.use(session(config.sessionConfig));

// use helmet
app.use(helmet({
  frameguard: false
}));

// enable csrf protection
app.use(csrf({cookie: true}));
app.use(function(req, res, next) {
  res.locals.csrf_token = req.csrfToken();
  next();
});

// use flash messages
app.use(flash());
app.use(require('./middlewares/flash'));

// use custom responses
app.use(require('./middlewares/responses'));

// add site info
app.use(function(req, res, next) {
  res.locals.siteInfo = config.siteInfo;
  res.locals.pageTitle = infoHelper.pageTitle(req);
  next();
});

// define app routes
require('./routes')(app);

// invalid route error
app.use('/*', function(req, res, next) {
  res.status(404);
  res.renderNoAuth('responses/404');
});

// handle error
app.use(function(err, req, res, next) {
  console.log('## ERROR ##');
  console.log(err.stack);
  res.status(500);
  res.renderNoAuth('responses/500');
});

// start server
server.listen(PORT, function() {
  console.log('INFO:', 'Server started on port ' + PORT);
});

module.exports = app;