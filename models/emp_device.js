'use strict'
module.exports = function(sequelize, DataTypes) {
  var emp_device = sequelize.define('emp_device', {
    laptop_no: DataTypes.STRING,
    mouse_no: DataTypes.STRING,
    keyboard_no: DataTypes.STRING,
    employeeId: DataTypes.INTEGER
  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      emp_device.associate = function(model) {
        emp_device.belongsTo(model.employee, {foreignKey: 'employeeId', targetKey: 'id', as: 'employee'});
      }
  return emp_device;
}
