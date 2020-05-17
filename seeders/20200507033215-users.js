'use strict';
const bcrypt = require('bcrypt');
const faker = require('faker');
const User = require('./../models/index').User;

const role_enums = ['admin', 'consultant', 'member', 'financial_advisor', 'manager', 'trainer', 'technician']

const seedUsers = async () => {
  let n = 15;
  for (let i = 0; i < n; i++) {
    let pwd = await bcrypt.hash('12345678', 10);
    const u = await User.create({
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: pwd,
      role: role_enums[faker.random.number(6)],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const pwd = await bcrypt.hash('12345678', 10)
    await seedUsers();
    return queryInterface.bulkInsert('Users', [{
      first_name: 'gym',
      last_name: 'admin',
      email: 'admin@test.com',
      username: 'admin',
      password: pwd,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
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
