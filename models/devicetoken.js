'use strict';
module.exports = function(sequelize, DataTypes) {
  var devicetoken = sequelize.define('devicetoken', {
    userId: DataTypes.INTEGER,
    token: DataTypes.STRING,
    added_at: DataTypes.DATE
  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      devicetoken.associate = function(models) {
        devicetoken.belongsTo(models.user, {foriegnKey: 'userId', targetKey: 'id', as: 'user'});
      }
  return devicetoken;
};
