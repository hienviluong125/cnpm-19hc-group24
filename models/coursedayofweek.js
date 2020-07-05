'use strict';
module.exports = (sequelize, DataTypes) => {
  const CourseDayOfWeek = sequelize.define('CourseDayOfWeek', {
    course_id: DataTypes.INTEGER,
    day_of_week_id: DataTypes.INTEGER
  }, {});
  CourseDayOfWeek.associate = function(models) {
    // associations can be defined here
  };
  return CourseDayOfWeek;
};