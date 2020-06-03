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
  //Left trainer list
  //All trainer doesnot have booking today
  const messages = req.flash('messages');
  const start = new Date();
  start.setHours(0,0,0,0);
  const end = new Date();
  end.setHours(23,59,59,999);
  const trainersThatHaveRequest = await User.findAll({
    attributes: ['id', 'role', 'gender', 'first_name', 'last_name'],
    where: {
      role: 'trainer'
    },
    include: [{
      model: Request,
      as: 'requestsFromMember',
      where: {
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

router.get('/:id/book', async function (req, res, next) {
  const currentUser = req.user;
  const now = new Date();
  let bookDate = new Date();

  if(typeof req.query.date !== 'undefined') {
    bookDate = new Date(req.query.date);
  }

  bookDate.setHours(0,0,0,0);
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
  start.setHours(0,0,0,0);
  const end = new Date(req.params.date);
  end.setHours(23,59,59,999);
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
