'use strict'
module.exports = function(sequelize, DataTypes) {
  var device = sequelize.define('device', {
    device_no: {
      type:DataTypes.INTEGER,
      unique: true,
      allowNull: false},
    device_name: DataTypes.STRING,
    device_code: DataTypes.STRING,
    device_company: DataTypes.STRING,
    charger: DataTypes.BOOLEAN,
    bag: DataTypes.BOOLEAN,
    mouse: DataTypes.BOOLEAN,
    keyboard: DataTypes.BOOLEAN,
    assign_status: DataTypes.BOOLEAN,

  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      device.associate = function(model) {
        device.hasMany(model.emp_device, {foreignKey: 'deviceId', as: 'device', onDelete: 'cascade'});
      }
  return device;
}
