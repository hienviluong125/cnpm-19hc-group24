module.exports = function (req, res, next) {
  if (req.user && typeof req.user !== 'undefined') {
    next();
  } else {
    req.flash('messages', [{ type: 'error', content: 'Please sign in first' }]);
    res.redirect('/users/sign-in');
  }
}
