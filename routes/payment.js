const express = require('express');
const moment = require('moment');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('./../models/index').User;
const Payment = require('./../models/index').Payment;
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');
const pagy = require('./..//helper/pagy');
const { paymentPdf } = require('./../helper/pdfmakeHelper');
// const PdfPrinter = require('pdfmake');
// const fs = require('fs');

router.get('/', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  const messages = req.flash('messages');
  const page = typeof (req.query.page) !== 'undefined' ? parseInt(req.query.page) : 1;
  let paymentPagy = await pagy({
    model: Payment,
    queryOption: {},
    limit: 10,
    page: page,
    include: [
      {
        model: User,
        as: 'user',
      },
      {
        model: User,
        as: 'staff',
      }
    ],
    order: [['date', 'DESC']]
  })

  return res.render('payments/index', { payments: paymentPagy.data, resourcePagy: paymentPagy, messages, resource: 'payments' });
});

router.get('/new', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  const errors = [];
  const users = await User.findAll({ attributes: ['id', 'first_name', 'last_name'], raw: true, where: { role: 'member' } })
  const emptyParams = emptyParamsBulder(["user_id", "date", "amount", "comment"]);
  return res.render('payments/new', { users, errors, ...emptyParams });
});

const validateNewPayment = [
  check('comment').notEmpty().withMessage('Comment cannot be blank'),
  check('date').notEmpty().withMessage('Date cannot be blank'),
  check('amount').notEmpty().withMessage('Amount cannot be blank'),
  check('user_id').notEmpty().withMessage('Please select a user'),
];
router.post('/', Authentication, Authorization(['admin', 'financial_advisor']), validateNewPayment, async function (req, res, next) {
  const currentUser = req.user;
  const users = await User.findAll({ attributes: ['id', 'first_name', 'last_name'], raw: true, where: { role: 'member' } })
  let { comment, date, amount, user_id } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('payments/new', { errors, users, comment, date, amount, user_id });
  }


  try {
    let params = req.body;
    params.date = moment(req.body.date, 'MM-DD-YYYY').toDate();
    params.amount = req.body.amount.replace(/,/g, '')

    const payment = await Payment.create({ ...params, staff_id: currentUser.id, method: 'cash' });
    if (payment) {
      req.flash('messages', [{ type: 'success', content: 'Payment created successfully' }]);
      return res.redirect('/payments');
    }
    errors = [{ msg: 'Fail to create an payment' }];
    return res.render('payments/new', { comment, date, amount, user_id, errors, users });
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('payments/new', { comment, date, amount, user_id, errors, users });
  }

  return res.render('payments/new', { comment, date, amount, user_id, errors, users });
});

router.get('/:id/print', async function (req, res, next) {
  try {
    let payment = await Payment.findOne({ where: { id: req.params.id }, include: [{ model: User, as: 'user' }] });
    console.log({ payment });
    let binaryResult = await paymentPdf(payment);
    res.contentType('application/pdf').send(binaryResult);
  } catch (err) {
    res.send(`<h2>There was an error displaying the PDF document</h2>Error message: ${err.message}`);
  }
});

module.exports = router;
