module.exports = function Authorization(roles) {
  return (req, res, next) => {
    // return next();
    if (res.locals.user && typeof res.locals.user !== 'undefined') {
      if (roles.includes(res.locals.user.role)) {
        return next();
      } else {
        res.json("You don't have enough permission to access this page")
      }
    }
    req.flash('errors', { message: { type: 'error', content: 'Please log in.' } });
    res.redirect('/users/sign-in');
  }
}
