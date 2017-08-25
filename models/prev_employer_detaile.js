

'use strict'
module.exports = function(sequelize, DataTypes) {
  var prev_employer_detaile = sequelize.define('prev_employer_detaile', {
    company_name: DataTypes.STRING,
    leaving_date: DataTypes.DATE,
    CTC: DataTypes.STRING,
    HR_no: DataTypes.STRING,
    TL_no: DataTypes.STRING,
    employeeId: DataTypes.INTEGER
  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      prev_employer_detaile.associate = function(model) {
        prev_employer_detaile.belongsTo(model.employee, {foreignKey: 'employeeId', targetKey: 'id', as: 'employee'});
      }
  return prev_employer_detaile;
}
