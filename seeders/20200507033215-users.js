'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return bcrypt.hash('12345678', 10).then(pwd => {
      return queryInterface.bulkInsert('Users', [{
        first_name : 'hienviluong',
        last_name : 'hien',
        email : 'admin@test.com',
        username: 'admin',
        password: pwd,
        role: 'admin',
        createdAt : new Date(),
        updatedAt : new Date(),
      }], {});
    })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
