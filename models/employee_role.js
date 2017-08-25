'use strict';
module.exports = function(sequelize, DataTypes) {
  var employee_role = sequelize.define('employee_role', {
    role: DataTypes.STRING
  },{
    freezeTableName: true,
    freezeColumnName: true
   });
      employee_role.associate = function(models) {
        employee_role.hasMany(models.employee,{foreignKey: 'employee_roleId', as: 'employees'});
      }

  return employee_role;
};
