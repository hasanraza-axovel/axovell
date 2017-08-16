'use strict';
module.exports = function(sequelize, DataTypes) {
  var devicetoken = sequelize.define('devicetoken', {
    user_id: DataTypes.INTEGER,
    token: DataTypes.STRING,
    added_at: DataTypes.DATE
  },{
    classMethods: {
      associate: function(models) {

      }
    }
  });
  return devicetoken;
};
