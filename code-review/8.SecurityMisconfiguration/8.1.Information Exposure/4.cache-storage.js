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

// enable caching
app.use(cache('1 month'));

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