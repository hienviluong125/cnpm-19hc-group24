const express = require('express');
const router = express.Router();
const passport = require('passport');
const { Op } = require('sequelize');
const User = require('./../models/index')['User'];
const Request = require('./../models/index')['Request'];
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');
const pagy = require('./..//helper/pagy');
const moment = require('moment');

router.get('/', async function (req, res, next) {
  const messages = req.flash('messages');
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const trainersThatHaveRequest = await User.findAll({
    attributes: ['id', 'role', 'gender', 'first_name', 'last_name'],
    where: {
      role: 'trainer'
    },
    include: [{
      model: Request,
      as: 'requestsFromMember',
      where: {
        accepted: true,
        book_at: {
          [Op.between]: [start, end]
        }
      },
      group: ['requestsFromMember.trainer_id']
    }]
  });

  const availableTrainers = await User.findAll({
    where: {
      role: 'trainer',
      id: {
        [Op.notIn]: trainersThatHaveRequest.map(trainer => trainer.id)
      }
    }
  });

  res.render('trainers/index', { trainers: availableTrainers, messages });
});

router.get('/booking-requests', async function (req, res, next) {
  const currentUser = req.user;
  const messages = req.flash('messages');
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const requests = await Request.findAll({
    where: {
      trainer_id: currentUser.id,
      accepted: false,
      book_at: {
        [Op.between]: [start, end]
      }
    },
    include: [{
      model: User,
      as: 'user'
    }]
  });

  const anonymousRequests = await Request.findAll({
    where: {
      accepted: false,
      trainer_id: null
    },
    raw: true
  });

  res.render('trainers/booking_requests', { requests, messages, anonymousRequests });
});

router.get('/anonymous/requests', async function (req, res, next) {
  let bookDate = new Date();

  if (typeof req.query.date !== 'undefined') {
    bookDate = new Date(req.query.date);
  }

  let bookDateStart = bookDate;
  let bookDateEnd = bookDate;
  bookDateStart.setHours(0, 0, 0, 0);
  bookDateEnd.setHours(23, 59, 59, 999);

  const requests = await Request.findAll({
    where: {
      accepted: false,
      trainer_id: null,
      book_at: {
        [Op.between]: [bookDateStart, bookDateEnd]
      },
    },
    include: [{
      model: User,
      as: 'user'
    }]
  });

  res.json({ requests });
});

router.post('/anonymous/booking', async function (req, res, next) {
  const currentUser = req.user;
  let parsedDte = moment(req.body.date, 'YYYY-MM-DD').toDate();

  let start = parsedDte
  start.setHours(0, 0, 0, 0);
  let end = parsedDte
  end.setHours(23, 59, 59, 999);

  let isExist = await Request.findOne({
    where: {
      accepted: false,
      book_at: {
        [Op.between]: [start, end]
      },
      user_id: currentUser.id
    }
  });

  if (!isExist) {
    let request = await Request.create({
      user_id: currentUser.id,
      accepted: false,
      book_at: start
    });

    if (request) {
      req.flash('messages', [{ type: 'success', content: 'Thank for using our service, our trainer will contact you proactively as soon as possible' }]);
    } else {
      req.flash('messages', [{ type: 'danger', content: `Something went wrong` }]);
    }

    return res.redirect('/trainers')
  }

  req.flash('messages', [{ type: 'info', content: "It seem like you've already booked on this day, please try again or book another day" }]);
  return res.redirect('/trainers')
})

router.get('/:id/accept', async function (req, res, next) {
  let request = await Request.findOne({ where: { id: req.params.id } });
  request.accepted = true;
  let result = await request.save();

  if (result) {
    let user = await request.getUser();
    req.flash('messages', [{ type: 'success', content: `Your accepted request from Mr/ms ${user.first_name} ${user.last_name}. Please contact to him/her as soon as possible` }]);
  } else {
    req.flash('messages', [{ type: 'danger', content: 'It seem something went wrong.' }]);
  }

  res.redirect('/trainers/booking-requests')
})

router.get('/:id/book', async function (req, res, next) {
  const currentUser = req.user;
  const now = new Date();
  let bookDate = new Date();

  if (typeof req.query.date !== 'undefined') {
    bookDate = new Date(req.query.date);
  }

  bookDate.setHours(0, 0, 0, 0);
  let bookDateStart = bookDate;
  let bookDateEnd = bookDate;
  bookDateStart.setHours(0, 0, 0, 0);
  bookDateEnd.setHours(23, 59, 59, 999);

  const bookingRequest = await Request.findOne({
    where: {
      user_id: currentUser.id,
      book_at: {
        [Op.between]: [bookDateStart, bookDateEnd]
      }
    },
  });

  if (bookingRequest) {
    req.flash('messages', [{ type: 'info', content: 'You have already requested to this trainer, please wait for his/her reply' }]);
    return res.redirect('/trainers');
  }

  const createdRequest = await Request.create({
    user_id: currentUser.id,
    trainer_id: req.params.id,
    book_at: bookDate,
    accepted: false
  });

  if (createdRequest) {
    req.flash('messages', [{ type: 'success', content: 'Your booking was succesful. Trainer will contact you soon!' }]);
  } else {
    req.flash('messages', [{ type: 'danger', content: 'Fail to book a trainer, please try again!' }]);
  }

  res.redirect('/trainers');
})

router.get('/:date', async function (req, res, next) {
  const start = new Date(req.params.date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(req.params.date);
  end.setHours(23, 59, 59, 999);
  const trainersThatHaveRequest = await User.findAll({
    attributes: ['id'],
    where: {
      role: 'trainer'
    },
    include: [{
      model: Request,
      as: 'requestsFromMember',
      where: {
        book_at: {
          accepted: true,
          [Op.between]: [start, end]
        }
      },
      group: ['requestsFromMember.trainer_id']
    }]
  });

  const availableTrainers = await User.findAll({
    where: {
      role: 'trainer',
      id: {
        [Op.notIn]: trainersThatHaveRequest.map(trainer => trainer.id)
      }
    }
  });

  res.status(200).json({ trainers: availableTrainers });
});


module.exports = router;
