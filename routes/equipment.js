const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const Equipment = require('./../models/index').Equipment;
const Request = require('./../models/index').Request;
const { check, validationResult } = require('express-validator');
const emptyParamsBulder = require('./../helper/emptyParamsBuilder');
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');
const pagy = require('./..//helper/pagy');

router.get('/', Authentication, Authorization(['admin', 'technician']), async function (req, res, next) {
  const messages = req.flash('messages');
  const page = typeof (req.query.page) !== 'undefined' ? parseInt(req.query.page) : 1;
  let equipmentPagy = await pagy({ model: Equipment, queryOption: {}, limit: 10, page: page })

  return res.render('equipments/index', { equipments: equipmentPagy.data, resourcePagy: equipmentPagy, messages, resource: 'equipments' });
});

router.get('/new', Authentication, Authorization(['admin', 'technician']), async function (req, res, next) {
  const errors = [];
  const emptyParams = emptyParamsBulder(['name', 'quantity', 'description']);
  return res.render('equipments/new', { errors, ...emptyParams });
});

const validateNewEquipment = [
  check('name').notEmpty().withMessage('Name cannot be blank'),
  check('description').notEmpty().withMessage('Description cannot be blank'),
  check('quantity').notEmpty().withMessage('Quantity cannot be blank'),
];
router.post('/', Authentication, Authorization(['admin', 'technician']), validateNewEquipment, async function (req, res, next) {
  const { name, description, quantity } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('equipments/new', { errors, name, description, quantity });
  }
  const params = req.body;
  try {
    const equipment = await Equipment.create(params);
    if (equipment) {
      req.flash('messages', [{ type: 'success', content: 'Equipment created successfully' }]);
      return res.redirect('/equipments');
    }
    errors = [{ msg: 'Fail to create an Equipment' }];
    return res.render('equipments/new', { errors, name, description, quantity });
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('equipments/new', { errors, name, description, quantity });
  }
});

router.get('/:id/edit', Authentication, Authorization(['admin', 'technician']), async function (req, res, next) {
  let errors = [];
  try {
    const equipment = await Equipment.findOne({ where: { id: req.params.id } });
    if (equipment) {
      const { name, description, quantity } = equipment;
      return res.render('equipments/edit', { errors, name, description, quantity, id: req.params.id });
    }
    req.flash('messages', [{ type: 'error', content: 'Fail to access equipment edit page' }]);
    return res.redirect('/equipments')
  } catch (err) {
    req.flash('messages', [{ type: 'error', content: 'Fail to access equipment edit page' }]);
    return res.redirect('/equipments')
  }
});

const validateEditUser = [
  check('name').notEmpty().withMessage('Name cannot be blank'),
  check('description').notEmpty().withMessage('Description cannot be blank'),
  check('quantity').notEmpty().withMessage('Quantity cannot be blank'),
];
router.post('/:id/edit', Authentication, Authorization(['admin', 'technician']), validateEditUser, async function (req, res, next) {
  const params = req.body;
  const { name, description, quantity } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array().map(error => ({ msg: error.msg }));
    return res.render('equipments/edit', { errors, name, description, quantity, id: req.params.id });
  }
  try {
    const equipment = await Equipment.findOne({ where: { id: req.params.id } });
    await Equipment.update(params, { where: { id: req.params.id } });
    req.flash('messages', [{ type: 'success', content: 'equipment updated successfully' }]);
    return res.redirect('/equipments');
  } catch (err) {
    errors = err.errors.map(eachError => ({ msg: eachError.message }));
    return res.render('equipments/edit', { errors, name, description, quantity, id: req.params.id });
  }
});

router.get('/:id/delete', Authentication, Authorization(['admin', 'technician']), async function (req, res, next) {
  try {
    await Equipment.destroy({ where: { id: req.params.id } });
    req.flash('messages', [{ type: 'success', content: 'equipment deleted successfully' }]);
    return res.redirect('/equipments');
  } catch (err) {
    req.flash('messages', [{ type: 'error', content: 'Fail to delete equipment' }]);
    return res.redirect('/equipments');
  }
});

module.exports = router;
