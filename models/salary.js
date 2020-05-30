'use strict';
module.exports = (sequelize, DataTypes) => {
  const Salary = sequelize.define('Salary', {
    amount: DataTypes.DECIMAL,
    label: DataTypes.STRING
  }, {});
  Salary.associate = function(models) {
    // associations can be defined here
  };
  return Salary;
};