

'use strict'
module.exports = function(sequelize, DataTypes) {
  var emp_current_addr = sequelize.define('emp_current_addr', {
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    pincode: DataTypes.STRING,
    employeeId: DataTypes.INTEGER
  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      emp_current_addr.associate = function(model) {
        emp_current_addr.belongsTo(model.employee, {foreignKey: 'employeeId', targetKey: 'id', as: 'employee'});
      }

  return emp_current_addr;
}
