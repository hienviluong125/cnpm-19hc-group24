const app = require('./app');
const User = require('./models/index').User;
const Request = require('./models/index').Request;
const bcrypt = require('bcrypt');
const faker = require('faker');
const DayOfWeek = require('./models/index').DayOfWeek;

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

const seedRequest = async () => {
  let n = 3;
  let user_id = 3;
  let trainer_id = 4;
  for (let i = 0; i < n; i++) {
    Request.create({
      title: faker.lorem.words(),
      content: faker.lorem.words(),
      user_id: user_id,
      trainer_id: trainer_id
    });
  }
}

const seedDayOfWeeks = async () => {
  let days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  for(let eachDay of days) {
    DayOfWeek.create({ label: eachDay });
  }
}


// seedUsers();
// seedRequest();
// seedDayOfWeeks();

DayOfWeek.findAll({ raw: true }).then(res => console.log(res));


// User.findAll({ raw: true}).then(rs => console.log(rs));
// Request.findAll({ raw: true }).then(rs => console.log(rs));

// User
//   .findOne({ where: { id: 3 } })
//   .then(user => {
//     user.getRequests({ raw: true }).then( rs => {
//       console.log(rs);
//     });

//     console.log("============");

//     user.getRequestsFromMember({ raw: true }).then( rs => {
//       console.log(rs);
//     })
// });


// User
//   .findOne({ where: { id: 4 } })
//   .then(user => {
//     user.getRequestsFromMember({ raw: true }).then( rs => {
//       console.log("2", rs);
//     })
// });
