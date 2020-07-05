'use strict';
module.exports = (sequelize, DataTypes) => {
  const DayOfWeek = sequelize.define('DayOfWeek', {
    label: DataTypes.STRING
  }, {});
  DayOfWeek.associate = function(models) {
    // associations can be defined here
  };
  return DayOfWeek;
};