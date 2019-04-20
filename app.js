var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var basicAuth = require('basic-auth')

var indexRouter = require('./routes/index');
var tutorialsRouter = require('./routes/tutorials');
var aboutRouter = require('./routes/about');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Basic Auth
var allowedUsers = {
  "Express": "is good"
}
var judgeAllowedUse = function(credentials) {
  if (!credentials) {
    return false;
  }
  var username = credentials.name;
  var password = credentials.pass;
  var valid = true
  valid = !!allowedUsers[username] && allowedUsers[username] === password && valid;
  return valid;
}

app.use('/*', function (req, res, next) {
  if (req.originalUrl === '/about' || req.originalUrl === '/') {
    next();
  } else {
    var credentials = basicAuth(req);
    if (judgeAllowedUse(credentials)) {
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="tutorial"');
      next(createError(401));
    }
  }
});

app.use('/', indexRouter);
app.use('/tutorial', tutorialsRouter);
app.use('/about', aboutRouter);
app.get('/logout', function (req, res) {
  res.set('WWW-Authenticate', 'Basic realm="tutorial"');
  return res.sendStatus(401);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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
