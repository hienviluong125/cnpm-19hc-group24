'use strict';
module.exports = (sequelize, DataTypes) => {
  const WorkShift = sequelize.define('WorkShift', {
    label: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    day_of_week_id: DataTypes.INTEGER
  }, {});
  WorkShift.associate = function(models) {
    // associations can be defined here
    WorkShift.belongsTo(models.DayOfWeek, { foreignKey: 'day_of_week_id', as: 'dayOfWeek' })
  };
  return WorkShift;
};