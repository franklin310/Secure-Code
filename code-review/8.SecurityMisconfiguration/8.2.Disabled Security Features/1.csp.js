'use strict';

var config = require('./config');
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('https').createServer({key: fs.readFileSync(config.keyPath), cert: fs.readFileSync(config.certPath)}, app);
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var csrf = require('csurf');
var helmet = require('helmet');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var auth = require('./app/middlewares/auth');

var routes = require('./routes/index');
var leaves = require('./routes/leaves');

var PORT = process.env.PORT  config.port  3000;

// handlebars helpers
var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
      selected: function(option, value){
        if (option === value) {
          return ' selected';
        } else {
          return ''
        }
      }
    }
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
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

// set cookie parser
app.use(cookieParser(config.sessionConfig.secret));

// configure session store
config.sessionConfig.cookie.expires = new Date(Date.now() + 60 * 60  * 1000);
app.use(session(config.sessionConfig));

// use helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'cdn.evil.com'],
      imgSrc: ["'self'"]
    }
  }
}));

// enable csrf protection
app.use(csrf({cookie: true}));
app.use(function(req, res, next) {
    res.locals.csrf_token = req.csrfToken();
    next();
});

// Flash middleware
app.use(flash());

// Use auth middleware to set current user id in currentUserId to be used in views.
app.use(auth.getCurrentUserId);

// define app routes
app.use('/', routes);

// redirect unauthenticated users to login page
app.use(auth.isAuthenticated);

// Define authenticated routes
app.use('/leaves', leaves);

// invalid route error
app.use('/*', function(req, res, next) {
    res.status(404);
    res.render("404", {text: 'Resource not found.'});
});

// handle error
app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    res.render("500", {text: "Something went wrong."});
});

// start server
server.listen(PORT, function() {
  console.log('INFO:', 'Server started on port ' + PORT);
});

module.exports = app;