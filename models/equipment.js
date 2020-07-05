'use strict';
module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    quantity: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {});
  Equipment.associate = function(models) {
    // associations can be defined here
  };
  return Equipment;
};