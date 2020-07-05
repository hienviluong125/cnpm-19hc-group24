'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserWorkShift = sequelize.define('UserWorkShift', {
    user_id: DataTypes.INTEGER,
    workshift_id: DataTypes.INTEGER
  }, {});
  UserWorkShift.associate = function(models) {
    // associations can be defined here
  };
  return UserWorkShift;
};