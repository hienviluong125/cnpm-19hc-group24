const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./../models/index').User;

module.exports = function (passport) {
  passport.use(new localStrategy({ usernameField: 'email' },
    (email, password, done) => {
      User.findOne({ email })
        .then(user => {
          if (user === null) {
            done(null, false, { message: { type: 'error', content: 'User is not registered.' } });
          } else {
             bcrypt.compare(password, user.password)
              .then(result => {
                if (result == true) {
                  done(null, user);
                } else {
                   done(null, false, { message: { type: 'error', content: 'Password incorrect.' } });
                 }
               })
              .catch(err => {
                 throw err;
              });
          }
        })
        .catch(err => {
          throw err;
        });
    })
  );
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, email: user.email });
  });

  passport.deserializeUser((user, done) => {
    User.findByPk(+user.id).then(returnUser => {
      let { username, email, role, id } = returnUser;
      done(null, { username, email, role, id });
    })
      .catch(err => {
        done(err, user);
      });
  });
};
