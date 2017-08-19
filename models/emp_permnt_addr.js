

'use strict'
module.exports = function(sequelize, DataTypes) {
  var emp_permnt_addr = sequelize.define('emp_permnt_addr', {
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    pincode: DataTypes.STRING,
    emp_id: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(model) {
        emp_device.belongsTo(model.employee, {foreignKey: 'emp_id', targetKey: 'id', as: 'employee'});
      }
    }
  });
  return emp_permnt_addr;
}
