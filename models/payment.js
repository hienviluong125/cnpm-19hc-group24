'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    date: DataTypes.DATE,
    comment: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    method: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    staff_id: DataTypes.INTEGER
  }, {});
  Payment.associate = function(models) {
    // associations can be defined here
    Payment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Payment.belongsTo(models.User, { foreignKey: 'staff_id', as: 'staff' });
  };
  return Payment;
};
