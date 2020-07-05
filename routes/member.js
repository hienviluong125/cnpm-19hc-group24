const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('./../models/index').User;
const Package = require('./../models/index').Package;
const UserPackage = require('./../models/index').UserPackage;
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');
const pagy = require('./..//helper/pagy');

router.get('/', Authentication, Authorization(['admin', 'consultant']), async function (req, res, next) {
  const messages = req.flash('messages');
  const page = typeof (req.query.page) !== 'undefined' ? parseInt(req.query.page) : 1;
  let userPagy = await pagy({ model: User, queryOption: { role: 'member' }, limit: 10, page: page })

  return res.render('members/index', { users: userPagy.data, resourcePagy: userPagy, messages, resource: 'members' });
});

router.get('/new', Authentication, Authorization(['admin', 'consultant']), async function (req, res, next) {
  const errors = [];
  const emptyParams = emptyParamsBulder(['username', 'first_name', 'last_name', 'email', 'phone', 'address']);
  return res.render('members/new', { errors, ...emptyParams, gender: 'male' });
});

const validateNewMember = [
  check('username').notEmpty().withMessage('Username cannot be blank'),
  check('first_name').notEmpty().withMessage('First name cannot be blank'),
  check('last_name').notEmpty().withMessage('Last name cannot be blank'),
  check('gender').notEmpty().withMessage('Gender cannot be blank'),
  check('phone').notEmpty().withMessage('Phone number cannot be blank').isMobilePhone().withMessage('Invalid phone number'),
  check('address').notEmpty().withMessage('Address cannot be blank'),
  check('email').notEmpty().withMessage('Email cannot be blank').isEmail().withMessage('Invalid email'),
  check('password').notEmpty().withMessage('Password cannot be blank'),
];
router.post('/', Authentication, Authorization(['admin', 'consultant']), validateNewMember, async function (req, res, next) {
  let { username, first_name, last_name, email, gender, phone, address, password } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('members/new', { errors, username, first_name, last_name, email, gender, phone, address });
  }

  let pwd = await bcrypt.hash(password, 10);
  let params = req.body;
  params.password = pwd;

  try {
    const user = await User.create(params);
    if (user) {
      req.flash('messages', [{ type: 'success', content: 'Member created successfully' }]);
      return res.redirect('/members');
    }
    errors = [{ msg: 'Fail to create an member account' }];
    return res.render('members/new', { errors, username, first_name, last_name, email, gender, phone, address });
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('members/new', { errors, username, first_name, last_name, email, gender, phone, address });
  }
});

router.get('/:id/packages', Authentication, Authorization(['admin', 'consultant']), async function (req, res, next) {
  const messages = req.flash('messages');
  const userId = req.params.id;
  const member = await User.findOne({ where: { id: userId } });
  const packages = await Package.findAll()
  const userPackages = await UserPackage.findAll({ raw: true, where: { user_id: userId } });
  return res.render('members/packages', { packages, userId, userPackages, member, messages });
});

router.post('/:id/packages', Authentication, Authorization(['admin', 'consultant']), async function (req, res, next) {
  const userId = req.params.id;
  let selectedPackages = []

  for (let package in req.body) {
    selectedPackages.push(package);
  }

  await UserPackage.destroy({ where: { user_id: userId } });

  if (selectedPackages.length > 0) {
    let packagesParam = selectedPackages.map(packageId => ({ package_id: packageId, user_id: userId }));
    await UserPackage.bulkCreate(packagesParam);

    req.flash('messages', [{ type: 'success', content: 'Packages added for this member succesfully' }]);

  } else {
    req.flash('messages', [{ type: 'success', content: 'Removed all packages succesfully' }]);
  }

  return res.redirect(`/members/${userId}/packages`)

});
module.exports = router;
