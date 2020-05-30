'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    amount: DataTypes.DECIMAL,
    method: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    staff_id: DataTypes.INTEGER
  }, {});
  Payment.associate = function(models) {
    // associations can be defined here
  };
  return Payment;
};