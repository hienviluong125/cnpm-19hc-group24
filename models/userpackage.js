'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserPackage = sequelize.define('UserPackage', {
    user_id: DataTypes.INTEGER,
    package_id: DataTypes.INTEGER
  }, {});
  UserPackage.associate = function(models) {
    // associations can be defined here
  };
  return UserPackage;
};