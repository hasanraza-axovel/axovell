'use strict';
module.exports = function(sequelize, DataTypes) {
  var user_role = sequelize.define('user_role', {
    role: DataTypes.STRING
  }, {
    freezeTableName: true,
    freezeColumnName: true
  });
      user_role.associate = function(models) {
        user_role.hasMany(models.user, {foreignKey: 'user_roleId', as: 'user'});
      }
  return user_role;
};
