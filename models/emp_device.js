'use strict'
module.exports = function(sequelize, DataTypes) {
  var emp_device = sequelize.define('emp_device', {
    deviceId : DataTypes.INTEGER,
    employeeId: DataTypes.INTEGER,
    device_no: DataTypes.INTEGER
  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      emp_device.associate = function(model) {
        emp_device.belongsTo(model.employee, {foreignKey: 'employeeId', targetKey: 'id', as: 'employee'});
        emp_device.belongsTo(model.device, {foreignKey: 'deviceId', targetKey: 'id', as: 'device'});
      }
  return emp_device;
}
