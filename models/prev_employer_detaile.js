

'use strict'
module.exports = function(sequelize, DataTypes) {
  var prev_employer_detaile = sequelize.define('prev_employer_detaile', {
    company_name: DataTypes.STRING,
    leaving_date: DataTypes.DATE,
    CTC: DataTypes.STRING,
    HR_no: DataTypes.STRING,
    TL_no: DataTypes.STRING,
    emp_id: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(model) {
        emp_device.belongsTo(model.employee, {foreignKey: 'emp_id', targetKey: 'id', as: 'employee'});
      }
    }
  });
  return prev_employer_detaile;
}
