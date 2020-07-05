const express = require('express');
const router = express.Router();
const passport = require('passport');
const Package = require('./../models/index').Package;
const Authentication = require('./../middlewares/authentication');
const Authorization = require('./../middlewares/authorization');

/* GET home page. */
router.get('/', Authentication, function (req, res, next) {
  const messages = req.flash('messages');
  res.render('index', { title: 'Express', messages });
});

router.get('/dashboard/packages', async function (req, res, next) {
  const packages = await Package.findAll()
  res.render('dashboard_packages', { packages });
})

router.get('/packages/:id', async function (req, res, next) {
  const package = await Package.findOne({ where: { id: req.params.id } });
  res.render('package_detail', { package, layout: false });
})


module.exports = router;
