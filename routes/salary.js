const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('./../models/index').User;
const Salary = require('./../models/index').Salary;
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');
const pagy = require('./..//helper/pagy');

const toCurrency = (str) => {
  try {
    return parseFloat(str).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  } catch(err) {
    return '';
  }

}

router.get('/', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  const messages = req.flash('messages');
  const page = typeof (req.query.page) !== 'undefined' ? parseInt(req.query.page) : 1;
  let salaryPagy = await pagy({
    model: Salary, queryOption: {}, limit: 10, page: page, include: [
      {
        model: User,
        as: 'user',
      }
    ],
  })

  return res.render('salaries/index', { salaries: salaryPagy.data, resourcePagy: salaryPagy, messages, resource: 'salaries', toCurrency: toCurrency });
});

router.get('/new', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  const errors = [];
  let users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name'],
    where: {
      role: {
        [Op.not]: 'admin'
      }
    }
  })
  const emptyParams = emptyParamsBulder(['user_id', 'amount', 'label']);
  return res.render('salaries/new', { errors, ...emptyParams, users });
});

const validateNewSalary = [
  check('user_id').notEmpty().withMessage('User cannot be blank'),
  check('amount').notEmpty().withMessage('Amount cannot be blank'),
];
router.post('/', Authentication, Authorization(['admin', 'financial_advisor']), validateNewSalary, async function (req, res, next) {
  let users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name'],
    where: {
      role: {
        [Op.not]: 'admin'
      }
    }
  })

  const { user_id, amount, label } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('salaries/new', { errors, user_id, amount, label, users });
  }
  let params = req.body;
  params.amount = req.body.amount.replace(/,/g, '')

  try {
    let isExist = await Salary.findOne({ where: { user_id: user_id } });
    if(isExist) {
      errors = [{ msg: 'This user already have salary record on system' }];
      return res.render('salaries/new', { errors, user_id, amount, label, users });
    }

    const salary = await Salary.create(params);
    if (salary) {
      req.flash('messages', [{ type: 'success', content: 'salary created successfully' }]);
      return res.redirect('/salaries');
    }
    errors = [{ msg: 'Fail to create an salary' }];
    return res.render('salaries/new', { errors, user_id, amount, label, users });
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('salaries/new', { errors, user_id, amount, label, users });
  }
});


router.get('/:id/edit', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  let users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name'],
    where: {
      role: {
        [Op.not]: 'admin'
      }
    }
  });
  let errors = [];
  try {
    const salary = await Salary.findOne({ where: { id: req.params.id } });
    if (salary) {
      let { user_id, amount, label } = salary;
      amount = toCurrency(amount);
      return res.render('salaries/edit', { errors, user_id, amount, label, id: req.params.id, users });
    }
    req.flash('messages', [{ type: 'error', content: 'Fail to access salary edit page' }]);
    return res.redirect('/salaries')
  } catch (err) {
    console.log("ERROR", err);
    req.flash('messages', [{ type: 'error', content: 'Fail to access salary edit page' }]);
    return res.redirect('/salaries')
  }
});

const validateEditSalary = [
  check('user_id').notEmpty().withMessage('User cannot be blank'),
  check('amount').notEmpty().withMessage('Amount cannot be blank'),
];
router.post('/:id/edit', Authentication, Authorization(['admin', 'financial_advisor']), validateEditSalary , async function (req, res, next) {
  let users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name'],
    where: {
      role: {
        [Op.not]: 'admin'
      }
    }
  });
  let params = req.body;
  params.amount = req.body.amount.replace(/,/g, '')
  let { user_id, amount, label } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('salaries/edit', { errors, user_id, amount, label, id: req.params.id, users });
  }
  try {
    let salary = await Salary.findOne({ where: { id: req.params.id } });
    await Salary.update(params, { where: { id: req.params.id } });
    req.flash('messages', [{ type: 'success', content: 'salary updated successfully' }]);
    return res.redirect('/salaries');
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('salaries/edit', { errors, user_id, amount, label, id: req.params.id , users});
  }
});

router.get('/:id/delete', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  try {
    await Salary.destroy({ where: { id: req.params.id } });
    req.flash('messages', [{ type: 'success', content: 'Salary deleted successfully' }]);
    return res.redirect('/salaries');
  } catch (err) {
    req.flash('messages', [{ type: 'error', content: 'Fail to delete Salary' }]);
    return res.redirect('/salaries');
  }
});

module.exports = router;
