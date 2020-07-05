module.exports = function Authorization(roles) {
  return (req, res, next) => {
    const currentUser = req.user;
    if (currentUser && typeof currentUser !== 'undefined') {
      if (roles.includes(currentUser.role)) {
        return next();
      } else {
        res.json("You don't have enough permission to access this page")
      }
    }
    req.flash('errors', { message: { type: 'error', content: 'Please log in.' } });
    res.redirect('/users/sign-in');
  }
}
