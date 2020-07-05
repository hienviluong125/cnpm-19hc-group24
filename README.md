## node: >= v13.12.0
## npm: >= 6.14.4

create an '.env' file on root directory
please check env.sample file to get correct format
- DB_USER=postgres
- DB_PASSWORD=123456
- DB_NAME_DEVELOPMENT=qlpg_development
- DB_NAME_TEST=qlpg_test
- DB_NAME_PRODUCTION=qlpg_production
- DB_PORT=5432
- DB_HOST=localhost
- PORT=3000

how to install and init database ?
- npm install
- npm install --save-dev sequelize-cli
- npx sequelize-cli db:create
- npx sequelize-cli db:migrate
- npx sequelize-cli db:seed:all

how to run project ?
- npm run start
- visit localhost:3000

how to run seed database ?
- npm run seed

admin account:
- username: admin@gym.com
- password: 12345678

how to list routers ?
- 'npm run routes' to list all routes
- or 'npm run routes users' to list all user routes
