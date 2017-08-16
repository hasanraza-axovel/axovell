'use strict';
module.exports = function(sequelize, DataTypes) {
  var user_role = sequelize.define('user_role', {
    role: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        user_role.hasMany(models.user, {foreignKey: 'user_role_id', as: 'users'});

      }
    }
  });
  return user_role;
};
