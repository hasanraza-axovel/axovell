

'use strict'
module.exports = function(sequelize, DataTypes) {
  var emp_permnt_addr = sequelize.define('emp_permnt_addr', {
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    pincode: DataTypes.STRING,
    employeeId: DataTypes.INTEGER
  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      emp_permnt_addr.associate = function(model) {
        emp_permnt_addr.belongsTo(model.employee, {foreignKey: 'employeeId', targetKey: 'id', as: 'employee'});
      }
  return emp_permnt_addr;
}
