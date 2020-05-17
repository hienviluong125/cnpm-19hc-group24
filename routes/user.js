const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('./../models/index').User;
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');

router.get('/', Authentication, Authorization(['admin']), async function (req, res, next) {
  const messages = req.flash('messages');
  users = await User.findAll();
  return res.render('users/index', { users, messages });
});

router.get('/new', Authentication, Authorization(['admin']), async function (req, res, next) {
  const errors = [];
  const emptyParams = emptyParamsBulder(['username', 'first_name', 'last_name', 'email']);
  return res.render('users/new', { errors, ...emptyParams });
});

const validateNewUser = [
  check('username').notEmpty().withMessage('Username cannot be blank'),
  check('first_name').notEmpty().withMessage('First name cannot be blank'),
  check('last_name').notEmpty().withMessage('Last name cannot be blank'),
  check('role').notEmpty().withMessage('Role cannot be blank'),
  check('email').notEmpty().withMessage('Email cannot be blank').isEmail().withMessage('Invalid email'),
  check('password').notEmpty().withMessage('Password cannot be blank'),
];
router.post('/', Authentication, Authorization(['admin']), validateNewUser, async function (req, res, next) {
  const { username, first_name, last_name, email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('users/new', { errors, username, first_name, last_name, email });
  }
  const params = req.body;
  try {
    const user = await User.create(params);
    if (user) {
      req.flash('messages', [{ type: 'success', content: 'User created successfully' }]);
      return res.redirect('/users');
    }
    errors = [{ msg: 'Fail to create an user' }];
    return res.render('users/new', { errors, username, first_name, last_name, email });
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('users/new', { errors, username, first_name, last_name, email });
  }
});

router.get('/:id/edit', Authentication, Authorization(['admin']), async function (req, res, next) {
  let errors = [];
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (user) {
      const { username, last_name, first_name, email } = user;
      return res.render('users/edit', { errors, username, last_name, first_name, email, id: req.params.id });
    }
    req.flash('messages', [{ type: 'error', content: 'Fail to access user edit page' }]);
    return res.redirect('/users')
  } catch (err) {
    req.flash('messages', [{ type: 'error', content: 'Fail to access user edit page' }]);
    return res.redirect('/users')
  }
});

const validateEditUser = [
  check('username').notEmpty().withMessage('Username cannot be blank'),
  check('first_name').notEmpty().withMessage('First name cannot be blank'),
  check('last_name').notEmpty().withMessage('Last name cannot be blank'),
  check('role').notEmpty().withMessage('Role cannot be blank'),
  check('email').notEmpty().withMessage('Email cannot be blank').isEmail().withMessage('Invalid email')
];
router.post('/:id/edit', Authentication, Authorization(['admin']), validateEditUser, async function (req, res, next) {
  const params = req.body;
  const { username, first_name, last_name, email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('users/edit', { errors, username, first_name, last_name, email, id: req.params.id });
  }
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (user && user.role === 'admin' && params.role !== 'admin') {
      errors = [{ msg: 'Cannot change role of admin' }]
      return res.render('users/edit', { errors, username, first_name, last_name, email, id: req.params.id });
    }
    await User.update(params, { where: { id: req.params.id } });
    req.flash('messages', [{ type: 'success', content: 'User updated successfully' }]);
    return res.redirect('/users');
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('users/edit', { errors, username, first_name, last_name, email, id: req.params.id });
  }
});

router.get('/:id/delete', Authentication, Authorization(['admin']), async function (req, res, next) {
  try {
    await User.destroy({ where: { id: req.params.id } });
    req.flash('messages', [{ type: 'success', content: 'User deleted successfully' }]);
    return res.redirect('/users');
  } catch (err) {
    req.flash('messages', [{ type: 'error', content: 'Fail to delete user' }]);
    return res.redirect('/users');
  }
});

router.get('/sign-in', function (req, res, next) {
  if (req.user && req.user !== 'undefined' && req.originalUrl.includes('sign-in')) {
    req.flash('messages', [{ type: 'info', content: 'You already logged' }]);
    return res.redirect('/');
  }
  const messages = req.flash('messages');
  const layout = 'layouts/authentication'
  res.render('users/sign-in', { layout, messages });
});

router.post('/sign-in', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/sign-in',
    failureMessage: 'Email or password incorrect.'
  }, (error, user, info) => {

    if (error) { return next(error); }
    if (!user) {
      req.flash('messages', info.message);
      return res.redirect('/users/sign-in');
    }
    req.logIn(user, function (error) {
      if (error) { return next(error); }
      return res.redirect("/");
    });
  })(req, res, next);
});

router.get('/sign-out', Authentication, async function (req, res, next) {
  req.logout();
  res.redirect('/users/sign-in');
})

module.exports = router;
