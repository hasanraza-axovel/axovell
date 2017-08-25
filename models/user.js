'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    user_roleId: DataTypes.INTEGER,
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
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email','username']
      }
    ],
    freezeTableName: true,
    freezeColumnName: true
  });
      user.associate = function(models) {
        user.belongsTo(models.user_role,{ foreignKey: 'user_roleId', targetKey: 'id', as: 'userRole'});
        user.hasOne(models.employee, { foriegnKey:'userId', as: 'employee'});
        user.hasOne(models.devicetoken, { foriegnKey:'userId', as: 'devicetoken'});
      }
  return user;
};
