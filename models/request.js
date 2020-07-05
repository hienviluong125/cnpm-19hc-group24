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
    Request.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Request.belongsTo(models.User, { foreignKey: 'trainer_id', as: 'trainer' });

  };
  return Request;
};
