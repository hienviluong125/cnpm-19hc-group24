'use strict';
module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    trainer_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    accepted: DataTypes.BOOLEAN,
    book_at: DataTypes.DATE
  }, {});
  Request.associate = function(models) {
    // associations can be defined here
  };
  return Request;
};
