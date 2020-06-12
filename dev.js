const { Op } = require('sequelize')
const app = require('./app');
const User = require('./models/index').User;
const Request = require('./models/index').Request;
const bcrypt = require('bcrypt');
const faker = require('faker');
const Sequelize = require('./models/index').sequelize;
const DayOfWeek = require('./models/index').DayOfWeek;
const WorkShift = require('./models/index').WorkShift;
const UserWorkShift = require('./models/index').UserWorkShift;
const Salary = require('./models/index').Salary;
const Payment = require('./models/index').Payment;

const role_enums = ['consultant', 'member', 'financial_advisor', 'manager', 'trainer', 'technician']
const seedUsers = async ({ seedAdmin }) => {
  let pwd = await bcrypt.hash('12345678', 10);
  let rdGender = ['male', 'female'];
  if (seedAdmin) {
    await User.create({
      first_name: 'admin',
      last_name: 'gym manager',
      email: 'admin@gym.com',
      username: 'admin_gym',
      gender: rdGender[faker.random.number(1)],
      password: pwd,
      role: 'admin',
    });
  }

  let n = 30;
  for (let i = 0; i < n; i++) {
    await User.create({
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      gender: rdGender[faker.random.number(1)],
      username: faker.internet.userName(),
      password: pwd,
      role: role_enums[faker.random.number(5)],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

const seedRequest = async () => {
  const sampleBool = [true, false];
  let memberIds = await User.findAll({ where: { role: ['member'] }, limit: 5, raw: true, order: Sequelize.random() });
  let trainerIds = await User.findAll({ where: { role: ['trainer'] }, limit: 5, raw: true, order: Sequelize.random() });

  for (let mId of memberIds) {
    for (let tId of trainerIds) {
      Request.create({
        title: faker.lorem.words(),
        content: faker.lorem.words(),
        user_id: mId.id,
        book_at: faker.date.between('2020-06-01T00:00:00', '2020-06-30T00:00:00'),
        accepted: sampleBool[faker.random.number(1)],
        trainer_id: tId.id
      });
    }
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

  for (let eachDay of days) {
    DayOfWeek.create({ label: eachDay });
  }
}

const seedWorkShift = async () => {
  let days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  for (let day of days) {
    let st = new Date()
    let et = new Date()

    dow = await DayOfWeek.findOne({ where: { label: day } });

    st.setHours(7)
    et.setHours(10)
    await WorkShift.create({
      start_time: st,
      end_time: et,
      label: '7h ~ 10h',
      day_of_week_id: dow.id
    });

    st.setHours(10)
    et.setHours(13)
    await WorkShift.create({
      start_time: st,
      end_time: et,
      label: '10h ~ 13h',
      day_of_week_id: dow.id
    })

    st.setHours(13)
    et.setHours(16)
    await WorkShift.create({
      start_time: st,
      end_time: et,
      label: '13h ~ 16h',
      day_of_week_id: dow.id
    })

    st.setHours(16)
    et.setHours(19)
    await WorkShift.create({
      start_time: st,
      end_time: et,
      label: '16h ~ 19h',
      day_of_week_id: dow.id
    })

    st.setHours(19)
    et.setHours(21)
    await WorkShift.create({
      start_time: st,
      end_time: et,
      label: '19h ~ 21h',
      day_of_week_id: dow.id
    });
  }
}

const seedUserWorkShift = async () => {
  ws = await WorkShift.findAll({ raw: true });
  ws = ws.map(_ws => _ws.id);

  let consultantU = await User.findAll({
    where: {
      role: ['consultant']
    }, raw: true, order: Sequelize.random(), limit: 7
  });

  for (let u of consultantU) {
    let rdN = faker.random.number(1);

    if (rdN === 0) {
      for (let wsid of ws) {
        UserWorkShift.create({
          user_id: u.id,
          WorkShift: wsid
        });
      }
    }
  }

  let faU = await User.findAll({
    where: {
      role: ['financial_advisor']
    }, raw: true, order: Sequelize.random(), limit: 7
  });

  for (let u of faU) {
    let rdN = faker.random.number(1);

    if (rdN === 0) {
      for (let wsid of ws) {
        UserWorkShift.create({
          user_id: u.id,
          WorkShift: wsid
        });
      }
    }
  }

  let maU = await User.findAll({
    where: {
      role: ['manager']
    }, raw: true, order: Sequelize.random(), limit: 7
  });


  for (let u of maU) {
    let rdN = faker.random.number(1);

    if (rdN === 0) {
      for (let wsid of ws) {
        UserWorkShift.create({
          user_id: u.id,
          WorkShift: wsid
        });
      }
    }
  }

  let teU = await User.findAll({
    where: {
      role: ['technician']
    }, raw: true, order: Sequelize.random(), limit: 7
  });

  for (let u of teU) {
    let rdN = faker.random.number(1);

    if (rdN === 0) {
      for (let wsid of ws) {
        UserWorkShift.create({
          user_id: u.id,
          WorkShift: wsid
        });
      }
    }
  }
}

const seedSalary = async () => {
  const staffs = ['consultant', 'financial_advisor', 'manager', 'trainer', 'technician']

  for (let staff of staffs) {
    let users = await User.findAll({
      where: {
        role: [staff]
      }, raw: true, order: Sequelize.random()
    });

    for (let u of users) {
      await Salary.create({
        amount: faker.finance.amount(),
        label: faker.finance.amount().toString(),
        user_id: u.id
      });
    }
  }
}

const seedPayment = async () => {
  let members = await User.findAll({
    where: {
      role: ['member']
    }, raw: true, order: Sequelize.random()
  });

  let fas = await User.findAll({
    where: {
      role: ['financial_advisor']
    }, raw: true, order: Sequelize.random(), limit: 1
  });

  for (let mem of members) {
    for (let fa of fas) {
      Payment.create({
        amount: faker.finance.amount(),
        method: 'cash',
        user_id: mem.id,
        staff_id: fa.id
      });
    }
  }
}

const seedUserWithRole = async () => {
  const roles = ['consultant', 'member', 'financial_advisor', 'manager', 'trainer', 'technician']
  const emails = ['nhanvientuvan@gmail.com', 'thanhvien@gmail.com', 'nhanvienketoan@gmail.com', 'nhanvienquanli@gmail.com', 'huanluyenvien@gmail.com', 'nhanvienkythuat@gmail.com']

  let pwd = await bcrypt.hash('12345678', 10);

  for (let i = 0; i < roles.length; i++) {
    await User.create({
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: emails[i],
      username: faker.internet.userName(),
      gender: 'female',
      password: pwd,
      role: roles[i],
    });
  }
}

(async function () {
  // await seedUsers({ seedAdmin: true });
  // await seedDayOfWeeks();
  // await seedRequest();
  // await seedWorkShift();
  // await seedUserWorkShift();
  // await seedSalary();
  // await seedPayment();
  // await seedUserWithRole();

  let rs = await Request.findAll({
    where: {
      trainer_id: null,
      accepted: false,
    },
    raw: true,
  });

  console.log({rs});
})();
