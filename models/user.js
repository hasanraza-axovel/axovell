'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    user_role_id: DataTypes.INTEGER,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },

    password: DataTypes.STRING,
    // remember_token: DataTypes.STRING
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email','username']
      }
    ],
    classMethods: {
      associate: function(models) {
        user.belongsTo(model.user_role,{ foreignKey: 'user_role_id', targetKey: 'id', as: 'userRole'});
        user.hasMany(model.employee, { foriegnKey:'user_id', as: 'employee'});
      }
    }
  });
  return user;
};
