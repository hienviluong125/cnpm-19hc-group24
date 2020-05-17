const express = require('express');
const router = express.Router();
const passport = require('passport');

/* GET home page. */
router.get('/', function (req, res, next) {
  const messages = req.flash('messages');
  res.render('index', { title: 'Express', messages });
});


module.exports = router;
