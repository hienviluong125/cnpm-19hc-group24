'use strict';
module.exports = (sequelize, DataTypes) => {
  const Salary = sequelize.define('Salary', {
    amount: DataTypes.DECIMAL,
    label: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {});
  Salary.associate = function(models) {
    // associations can be defined here
    Salary.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };
  return Salary;
};
