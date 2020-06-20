
require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const passportLocalConfig = require('./config/passport-local')
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');
const User = require('./models/index').User;

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const trainerRouter = require('./routes/trainer');
const memberRouter = require('./routes/member');
const paymentRouter = require('./routes/payment');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/dashboard');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'hmmm', cookie: { maxAge: 3600000 },
  resave: true,
  saveUninitialized: true
}
));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.locals.moment = require('moment');

//Passport config
passportLocalConfig(passport);
app.use(function (req, res, next) {
  if (typeof req.user !== 'undefined') {
    res.locals.user = req.user;
  }

  return next();
})

if (typeof process.env['FAKE_ADMIN'] !== 'undefined') {
  app.use(async function (req, res, next) {
    // req.user = await User.findOne({raw: true, where: {email: 'admin@gym.com'}});
    // req.user = await User.findOne({ raw: true, where: { first_name: "Shakira" } });
    req.user = await User.findOne({ raw: true, where: { email: "nhanvienketoan@gmail.com" } });
    // req.user = await User.findOne({ raw: true, where: { email: 'thanhvien@gmail.com' }});
    // req.user = await User.findOne({ raw: true, where: {email: 'huanluyenvien@gmail.com'} });
    res.locals.user = req.user;
    return next();
  });
}

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/trainers', trainerRouter);
app.use('/members', memberRouter);
app.use('/payments', paymentRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { layout: false });
});

module.exports = app;
