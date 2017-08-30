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
    employee_roleId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ],
    freezeTableName: true,
    freezeColumnName: true

  });
      employee.associate = function(models) {
        employee.belongsTo(models.user, { foriegnKey: 'userId', targetKey: 'id', as:'user'});
        employee.belongsTo(models.employee_role, { foreignKey: 'employee_roleId', targetKey: 'id', as: 'employeeRole'});
        employee.hasOne(models.emp_device, {foreignKey: 'employeeId', as: 'empDevice', onDelete: 'cascade'});
        employee.hasOne(models.emp_current_addr, {foreignKey: 'employeeId', as: 'empCurrentAddrs', onDelete: 'cascade'});
        employee.hasOne(models.emp_permnt_addr, {foreignKey: 'employeeId', as: 'empPermntAddrs', onDelete: 'cascade'});
        employee.hasOne(models.prev_employer_detaile, {foreignKey: 'employeeId', as: 'prevEmpDetaile', onDelete: 'cascade'});
        employee.hasMany(models.document, {foreignKey: 'employeeId', as: 'document', onDelete: 'cascade'});
      };
  return employee;
};
