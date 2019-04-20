var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
var judgeAllowedUse = function(authorization) {
  if (!authorization || !authorization.startsWith("Basic")) {
    return false;
  }
  var encodedPassword = authorization.substring(6);
  var decodedPassword = Buffer(encodedPassword, 'base64').toString('binary');
  var colonIndex = decodedPassword.indexOf(':');
  var username = decodedPassword.slice(0, colonIndex);
  var password = decodedPassword.substring(colonIndex + 1);
  if (!!allowedUsers[username] && allowedUsers[username] === password) {
    return true;
  } else {
    return false;
  }
}

app.use('/*', function (req, res, next) {
  if (req.originalUrl === '/about' || req.originalUrl === '/') {
    next();
  } else {
    var authorization = req.headers["authorization"] || "";
    console.log(req.headers)
    if (judgeAllowedUse(authorization)) {
      next();
    } else {
      judgeAllowedUse(authorization)
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
