'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    gender: { 
      type: DataTypes.STRING
    },
    password: DataTypes.STRING,
    role: { type: DataTypes.ENUM, values: ['admin', 'consultant', 'member', 'financial_advisor', 'manager', 'trainer', 'technician'] },
    email: DataTypes.STRING
  }, {});
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Request, { foreignKey: 'user_id', as: 'requestsToTrainer' });
    User.hasMany(models.Request, { foreignKey: 'trainer_id', as: 'requestsFromMember' });
  };
  return User;
};
