'use strict';
module.exports = function(sequelize, DataTypes) {
  var employee_role = sequelize.define('employee_role', {
    role: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(models) {
        employee_role.hasMany(model.employee,{foreignKey: 'employee_role_id', as: 'employees'});
      }
    }
  });
  return employee_role;
};
