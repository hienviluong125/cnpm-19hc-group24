const express = require('express');
const moment = require('moment');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('./../models/index').User;
const { Op } = require('sequelize');
const IncomeAndExpense = require('./../models/index').IncomeAndExpense;
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');
const pagy = require('./..//helper/pagy');
const { incomeAndExpensePdf, incomeAndExpensePdfBy } = require('./../helper/pdfmakeHelper');
const MONTHS_INSTANCE = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

router.get('/', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  const messages = req.flash('messages');
  let filtertype = req.query.filtertype;
  let start = new Date();
  let end = new Date();
  let filterByDateStr = '';
  let filterByMonthStr = [-1, -1];
  let dateLabel = "Today";


  if (typeof filtertype !== 'undefined') {
    if (filtertype === 'bydate') {
      start = moment(req.query.date, 'MM/DD/YYYY').toDate();
      end = moment(req.query.date, 'MM/DD/YYYY').toDate();
      filterByDateStr = req.query.date;
      dateLabel = req.query.date;
    }
    if (filtertype === 'bymonth') {
      start = moment(`${req.query.month}/${req.query.year}`, 'MM/YYYY').startOf('month').toDate();
      end = moment(`${req.query.month}/${req.query.year}`, 'MM/YYYY').endOf('month').toDate();
      dateLabel = `${MONTHS_INSTANCE[parseInt(req.query.month) - 1]}, ${req.query.year}`
      filterByMonthStr[0] = req.query.month;
      filterByMonthStr[1] = req.query.year
    }
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);


  const incomeAndExpenses = await IncomeAndExpense.findAll({
    where: {
      date: {
        [Op.between]: [start, end]
      }
    }
  });
  res.render('incomeAndExpenses/index', { messages, incomeAndExpenses, filtertype, dateLabel, filterByDateStr, filterByMonthStr })
});

router.get('/new', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  const errors = [];
  const emptyParams = emptyParamsBulder(["date", "in_amount", "out_amount"]);
  return res.render('incomeAndExpenses/new', { errors, ...emptyParams });
});

const validateNewRecord = [
  check('in_amount').notEmpty().withMessage('Income amount cannot be blank'),
  check('out_amount').notEmpty().withMessage('Expense amount cannot be blank'),
];
router.post('/', Authentication, Authorization(['admin', 'financial_advisor']), validateNewRecord, async function (req, res, next) {
  let { date, in_amount, out_amount } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('incomeAndExpenses/new', { date, in_amount, out_amount, errors });
  }

  try {
    let params = req.body;
    params.date = moment(req.body.date, 'MM/DD/YYYY').toDate();
    params.in_amount = req.body.in_amount.replace(/,/g, '')
    params.out_amount = req.body.out_amount.replace(/,/g, '')

    const incomeAndExpense = await IncomeAndExpense.create(params)
    if (incomeAndExpense) {
      req.flash('messages', [{ type: 'success', content: 'Record created successfully' }]);
      return res.redirect(`/income-and-expenses?date=${moment(params.date).format('MM/DD/YYYY')}&filtertype=bydate`);
    }

    errors = [{ msg: 'Fail to create an record' }];
    return res.render('incomeAndExpenses/new', { date, in_amount, out_amount, errors });
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('incomeAndExpenses/new', { date, in_amount, out_amount, errors });
  }

  return res.render('incomeAndExpenses/new', { date, in_amount, out_amount, errors });
});

router.get('/:id/print', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  try {
    let record = await IncomeAndExpense.findOne({ where: { id: req.params.id } });
    let binaryResult = await incomeAndExpensePdf(record)

    res.contentType('application/pdf').send(binaryResult);
  } catch (err) {
    res.send(`<h2>There was an error displaying the PDF document</h2>Error message: ${err.message}`);
  }
});


router.get('/print', Authentication, Authorization(['admin', 'financial_advisor']), async function (req, res, next) {
  let filtertype = req.query.filtertype;
  let start = new Date();
  let end = new Date();
  let filterByDateStr = '';
  let filterByMonthStr = [-1, -1];
  let dateLabel = "Today";

  if (typeof filtertype !== 'undefined') {
    if (filtertype === 'bydate') {
      start = moment(req.query.date, 'MM/DD/YYYY').toDate();
      end = moment(req.query.date, 'MM/DD/YYYY').toDate();
      dateLabel = req.query.date;
    }
    if (filtertype === 'bymonth') {
      start = moment(`${req.query.month}/${req.query.year}`, 'MM/YYYY').startOf('month').toDate();
      end = moment(`${req.query.month}/${req.query.year}`, 'MM/YYYY').endOf('month').toDate();
      dateLabel = `${MONTHS_INSTANCE[parseInt(req.query.month) - 1]}, ${req.query.year}`
    }
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);


  try {
    let records = await IncomeAndExpense.findAll({
      where: {
        date: {
          [Op.between]: [start, end]
        }
      }
    });
    let binaryResult = await incomeAndExpensePdfBy('date', dateLabel, records);
    res.contentType('application/pdf').send(binaryResult);
  } catch (err) {
    res.send(`<h2>There was an error displaying the PDF document</h2>Error message: ${err.message}`);
  }
});

module.exports = router;
