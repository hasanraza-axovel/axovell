'use strict'
module.exports = function(sequelize, DataTypes) {
  var document = sequelize.define('document', {
    doc_name: DataTypes.STRING,
    doc_path: DataTypes.TEXT,
    emp_id: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(models){
        document.belongsTo(models.employee, {foriegnKey: 'emp_id', targetKey: 'id', as: 'employee'});
      }
    }
  });
  return document;
}
