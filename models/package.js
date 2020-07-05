'use strict';
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DECIMAL
  }, {});
  Package.associate = function(models) {
    // associations can be defined here
  };
  return Package;
};