'use strict';
module.exports = (sequelize, DataTypes) => {
  const IncomeAndExpense = sequelize.define('IncomeAndExpense', {
    in_amount: DataTypes.DECIMAL,
    out_amount: DataTypes.DECIMAL,
    date: DataTypes.DATE
  }, {});
  IncomeAndExpense.associate = function(models) {
    // associations can be defined here
  };
  return IncomeAndExpense;
};