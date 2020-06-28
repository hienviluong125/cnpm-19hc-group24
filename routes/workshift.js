const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('./../models/index').User;
const WorkShift = require('./../models/index').WorkShift;
const UserWorkShift = require('./../models/index').UserWorkShift;
const DayOfWeek = require('./../models/index').DayOfWeek;
const { Op } = require('sequelize')
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');
const pagy = require('./..//helper/pagy');
const SHIFT_CONSTANCE = [
  '7h ~ 10h',
  '10h ~ 13h',
  '13h ~ 16h',
  '16h ~ 19h',
  '19h ~ 21h',
]

const DAY_CONSTANCE = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

router.get('/', Authentication, Authorization(['admin', 'manager']), async function (req, res, next) {
  const workshifts = await initWorkshiftRecord();
  const messages = req.flash('messages');
  res.render('workshifts/index', { workshifts, messages });
})

router.get('/:id/users', Authentication, Authorization(['admin', 'manager']), async function (req, res, next) {
  let uws_records = await UserWorkShift.findAll({
    attributes: ['user_id'],
    where: {
      workshift_id: req.params.id
    }
  });

  uws_ids = uws_records.map(record => record.user_id);
  let users = await User.findAll({
    raw: true,
    where: { id: uws_ids },
    attributrs: ['id', 'first_name', 'last_name', 'role', 'email', 'gender', 'phone']
  });
  res.json({ users })
})

router.get('/new', Authentication, Authorization(['admin', 'manager']), async function (req, res, next) {
  const errors = [];
  const emptyParams = emptyParamsBulder(['user_id', 'day_label', 'shift_label']);
  let users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name'],
    where: {
      role: {
        [Op.not]: 'admin'
      }
    }
  })
  res.render('workshifts/new', { users, SHIFT_CONSTANCE, DAY_CONSTANCE, errors, ...emptyParams });
});

const validateNewWorkshift = [
  check('user_id').notEmpty().withMessage('User cannot be blank'),
  check('day_label').notEmpty().withMessage('Day of week cannot be blank'),
  check('shift_label').notEmpty().withMessage('Shift cannot be blank'),
];
router.post('/', Authentication, Authorization(['admin', 'manager']), validateNewWorkshift, async function (req, res, next) {
  let users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name'],
    where: {
      role: {
        [Op.not]: 'admin'
      }
    }
  });
  let errors = validationResult(req);
  let { user_id, day_label, shift_label } = req.body;
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('workshifts/new', { errors, users, DAY_CONSTANCE, SHIFT_CONSTANCE, user_id, day_label, shift_label });
  }

  try {
    let ws = await getWorkshift(day_label, shift_label);
    let uws = await UserWorkShift.findOne({ where: { user_id: user_id, workshift_id: ws.id } });
    if (uws) {
      errors = [{ msg: 'This user already working for this shift' }];
      return res.render('workshifts/new', { errors, users, DAY_CONSTANCE, SHIFT_CONSTANCE, user_id, day_label, shift_label });
    }
    await UserWorkShift.create({ user_id: user_id, workshift_id: ws.id });
    req.flash('messages', [{ type: 'success', content: 'Added succesfully' }]);
    return res.redirect('/workshifts');
  } catch (err) {
    errors = [{ msg: 'Something went wrong' }];
    return res.render('workshifts/new', { errors, users, DAY_CONSTANCE, SHIFT_CONSTANCE, user_id, day_label, shift_label });
  }

});

router.get('/:workshift_id/users/:user_id/remove', Authentication, Authorization(['admin', 'manager']), async function (req, res, next) {
  try {
    let uws = await UserWorkShift.findOne({ where: { user_id: req.params.user_id, workshift_id: req.params.workshift_id } });
    await uws.destroy();
    req.flash('messages', [{ type: 'success', content: 'Removed successfully' }]);
    res.redirect('/workshifts');
  } catch (err) {
    console.log(err);
    req.flash('messages', [{ type: 'danger', content: 'Something went wrong' }]);
    res.redirect('/workshifts');
  }
});


//helper functions
const getWorkshift = async (dayOfWeekLabel, shiftLabel) => {
  return WorkShift.findOne({
    attributes: ['label', 'id'],
    where: {
      label: shiftLabel
    },
    include: [
      {
        model: DayOfWeek, as: 'dayOfWeek',
        where: {
          label: dayOfWeekLabel
        }
      }
    ],
    raw: true
  });
}

const getUserOfWorkshift = async (dayOfWeekLabel, shiftLabel) => {
  let ws = await getWorkshift(dayOfWeekLabel, shiftLabel);
  let count = await UserWorkShift.count({
    where: {
      workshift_id: ws.id
    }
  });

  return { count, dayOfWeekLabel, shiftLabel, workshift_id: ws.id }
};

const initWorkshiftRecord = async () => {
  let emptyObj = {};

  for (let day of DAY_CONSTANCE) {
    let _emptyObj = {};
    let records = await Promise.all(SHIFT_CONSTANCE.map(shift => getUserOfWorkshift(day, shift)));
    for (let record of records) {
      _emptyObj[record.shiftLabel] = record;
    }
    emptyObj[day] = _emptyObj
  }

  return emptyObj;
}


module.exports = router;
