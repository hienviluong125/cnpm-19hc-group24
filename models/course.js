'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    trainer_id: DataTypes.INTEGER
  }, {});
  Course.associate = function(models) {
    // associations can be defined here
  };
  return Course;
};