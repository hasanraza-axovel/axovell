'use strict';
module.exports = function(sequelize, DataTypes) {
  var employee = sequelize.define('employee', {
    emp_fname: DataTypes.STRING,
    emp_lname: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    mob_no: DataTypes.STRING,
    emergency_cont_person: DataTypes.STRING,
    emergency_cont_no: DataTypes.STRING,
    service_cont_end: DataTypes.DATE,
    join_date: DataTypes.DATE,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: DataTypes.STRING,
    emp_role_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email', 'username']
      }
    ],
    classMethods: {
      associte: function(models) {
        employee.belongsTo(models.user, { foriegnKey: 'user_id', targetKey: 'id', as: 'user'});
        employee.belongsTo(models.employee_role, { foreignKey: 'employee_role_id', targetKey: 'id', as: 'employeeRole'});
        employee.hasMany(models.emp_device, {foreignKey: 'emp_id', as: 'empDevice'});
        employee.hasMany(models.emp_current_addr, {foreignKey: 'emp_id', as: 'empCurrentAddrs'});
        employee.hasMany(models.emp_permnt_addr, {foreignKey: 'emp_id', as: 'empPermntAddrs'});
        employee.hasMany(models.prev_employer_detaile, {foreignKey: 'emp_id', as: 'prevEmpDetaile'});
        employee.hasMany(models.Document, {foreignKey: 'emp_id', as: 'Document'});
      }
    }
  });
  return employee;
};
