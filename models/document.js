'use strict'
module.exports = function(sequelize, DataTypes) {
  var document = sequelize.define('document', {
    doc_name: DataTypes.STRING,
    doc_path: DataTypes.TEXT,
    employeeId: DataTypes.INTEGER
  },{
    freezeTableName: true,
    freezeColumnName: true
  });
      document.associate = function(models){
        document.belongsTo(models.employee, {foriegnKey: 'employeeId', targetKey: 'id', as: 'employee'});
      }
  return document;
}
