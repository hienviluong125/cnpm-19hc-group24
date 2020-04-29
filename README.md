node: >= v13.12.0
npm: >= 6.14.4

create an '.env' file on root directory
example
.env
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME_DEVELOPMENT=qlpg_development
DB_NAME_TEST=qlpg_test
DB_NAME_PRODUCTION=qlpg_production
DB_PORT=5432
DB_HOST=localhost
PORT=3000

how to install and init database ?
npm install
npm install --save-dev sequelize-cli
npx sequelize-cli db:create
npx sequelize-cli db:migrate

how to run project ?
npm run start
