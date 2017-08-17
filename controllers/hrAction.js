var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var moment = require('moment');
var bcrypt = require('bcrypt-nodejs');
var db = require('../models');

var async = require('async');
// var connection = require('../config/dbconnection');


module.exports = {
  addEmpDetail: addEmpDetail,
  addEmpDoc: addEmpDoc,
  addEmpDevice: addEmpDevice,
  addPrevEmplrDetail: addPrevEmplrDetail,
  getEmpDetail: getEmpDetail,
  listEmp: listEmp
}


function addEmpDetail(req, res, next) {

  req.checkBody({
    'firstName': {
      notEmpty: true,
      isLength: {
        options: [{min: 3, max: 255}],
        errorMessage: 'First Namee must be between 3 and 255 characters long'
      },
      matches: {
        options: [/^[a-zA-Z\s]*$/i],
        errorMessage: 'First Name should only contain letters'
      },
      errorMessage: 'First Name is required'
    },
    'lastName': {
      notEmpty: true,
      isLength: {
        options: [{ min: 3, max: 255 }],
        errorMessage: 'Last Name must be between 3 and 255 characters long'
      },
      matches: {
        options: [/^[a-zA-Z\s]*$/i],
        errorMessage: 'Last Name should only contain letters'
      },
      errorMessage: 'Last Name is required'
    },
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      },
      errorMessage: 'Email is required'
    },
    'join_date': {notEmpty: true, errorMessage: 'join Date is required'},
    'status' : {notEmpty: true, errorMessage: 'status is required'},
    'mob_no': {notEmpty: true, errorMessage: 'mobile no is require'},
    'service_cont_end': {notEmpty: true, errorMessage: 'service_cont_end is required'},
    'emp_role': {notEmpty: true, errorMessage: 'employee role id is required'},
    // 'user_id': {notEmpty: true, errorMessage: 'user id is required'},
    'username': {notEmpty: true, errorMessage: 'Username is required'},
    'password': {notEmpty: true, errorMessage: 'Password is required'},
    'emergency_cont_no': {notEmpty: true, errorMessage: 'Emergency contact number is required'},
    'emergency_cont_person': {notEmpty: true, errorMessage: 'Emergency contact Person is required'},
  });

  req.getValidationResult().then(function(result) {

    if(!result.isEmpty()) {

      return res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'Validation Failed'
        });
    }
    else {
      bcrypt.hash(req.body.password, null, null, function(err, hash) {
        if(err) return next(err);

        db.user_role.findOne({
          where: {
            role: 'employee'
          }
        }).then(function(userRole) {
          db.user.create({
            user_role_id: userRole.id,
            username: req.body.username,
            email: req.body.email,
            password: hash
          },{
            fields: ['user_role_id', 'username', 'email', 'password']
          }).then(function(data) {
            db.employee_role.findOne({
              where: {
                role: req.body.emp_role
              }
            }).then(function(employee_role) {
              console.log(req.body.join_date);

              db.employee.create({
                emp_fname: req.body.firstName,
                emp_lname: req.body.lastName,
                join_date: req.body.join_date,
                status: req.body.status,
                mob_no: req.body.mob_no,
                emergency_cont_no: req.body.emergency_cont_no,
                emergency_cont_person: req.body.emergency_cont_person,
                service_cont_end: req.body.service_cont_end,
                email: req.body.email,
                password: hash,
                emp_role_id: employee_role.id,
                user_id: data.id
              },{
                fields: ['emp_fname', 'emp_lname', 'join_date', 'status',
                       'mob_no', 'emergency_cont_no', 'emergency_cont_person',
                       'service_cont_end', 'email', 'password', 'emp_role_id',
                       'user_id']
              }).then(function(data) {
                return res.status(200)
                  .json({
                    status: 'success',
                    data: {
                      id: data.id
                    },
                    message: 'Data saved successfully'
                  });
              }).catch(Sequelize.ValidationError, function(err) {
                return res.status(422)
                  .json({
                    status: 'exception',
                    data: err.errors,
                    message: 'Validation Failed'
                  });
              }).catch(function(err) {
                return next(err);
              });
            }).catch(function(err) {
              return next(err);
            });
          }).catch(Sequelize.ValidationError, function(err) {
            return res.status(422)
              .json({
                status: 'exception',
                data: err.errors,
                message: 'Validation Failed'
              });
          }).catch(function(err) {
            return next(err);
          });
        }).catch(function(err) {
          return next(err);
        });
      });
    }
  });
}

function addEmpDoc() {

}

function addEmpDevice(req, res, next) {

  req.checkBody({
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid email'
      },
      errorMessage: 'employee id is required'
    }
  });

  req.getValidationResult().then(function(result) {
    if(!result.isEmpty()) {
      return res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'Validation Failed'
        });
    }
    else {
      db.employee.findOne({
        where: {
          email: req.body.email
        }
      }).then(function(employee) {
        if(employee) {
          db.emp_device.create({
            emp_id: employee.id,
            laptop_no: req.body.laptop_no,
            mouse_no: req.body.mouse_no,
            keyboard_no: req.body.keyboard_no
          },{
            fields: ['emp_id', 'laptop_no', 'mouse_no', 'keyboard_no']
          }).then(function(data) {
            return res.status(200)
              .json({
                status: 'success',
                data: {
                  id: data.id
                },
                message: 'Data Saved successfully'
              });
          }).catch(Sequelize.ValidationError, function(err) {

            return res.status(422)
              .json({
                status: 'exception',
                data: err.errors,
                message: 'Validation Failed'
              });
          }).catch(function(err) {
            return next(err);
          });
        }
        else {
          return res.status(404)
            .json({
              status: 'exception',
              message: 'This employee does not exist'
            });
        }
      }).catch(function(err) {
        return next(err);
      });
    }
  });
}

function addPrevEmplrDetail() {

}

function getEmpDetail(req, res, next) {
  // var qry = "SELECT * FROM employee WHERE ?";
  // var one = 1;
  // connection.query(qry, one, function(err, result) {
  //   if(err) {
  //     return res.status(404)
  //       .json({
  //         status: "exception",
  //         message: "database error"
  //       });
  //   }
  //
  //   else {
  //     if(result) {
  //       return res.status(200)
  //         .json({
  //           status: 'success',
  //           data: result,
  //           message: 'Employee details found successfully'
  //         });
  //     }
  //     else {
  //       return res.status(404)
  //         .json({
  //           status: 'exception',
  //           message: 'Employee details not found'
  //         })
  //     }
  //   }
  // });
}

function listEmp(req, res, next) {
  req.checkBody('userId', 'userId is required').notEmpty();
  req.getValidationResult().then(function(result) {

    if(!result.isEmpty()) {
      return res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'Validation Failed'
        });
    }
    else {
      db.user_role.findAll({
        where: {
          role: {
            $in: ['hr', 'admin']
          }
        },
        attribures: ['id','role']
      }).then(function(data) {
        var roleIds = [1,2];
        // data.forEach(function(value, key) {
        //   roleIds[keys] = value.id;
        // });
        console.log(req.body.userId);
        db.user.findOne({
          where: {
            id: req.body.userId
          }
        }).then(function(user) {
          if(user && !roleIds.includes(user.user_role_id)) {
            return res.status(401)
              .json({
                status: 'exception',
                message:  'Unauthorized Access!'
              });
            }
            else if(user) {
              db.employee.findAll({
                // include: [
                //   {model: db.employee_role, as: 'employeeRole', attributes: ['role']}
                // ],
                order: [
                  ['createdAt', 'DESC']
              ],
              attributes: ['id', 'emp_name', 'join_date', 'status', 'mob_no', 'emergency_cont_person', 'emergency_cont_no', 'service_cont_end', 'email']
            }).then(function(data) {
              return res.status(200)
                .json({
                  status: 'success',
                  data: data,
                  message: data.length + 'users found'
                });
            }).catch(function(err) {
              return next(err);
            });
            }
            else {
              return res.status(401)
                .json({
                  status: 'exception',
                  message: 'Unauthorized Access'
                });
            }
        }).catch(function(err) {
          return next(err);
        });
      }).catch(function(err) {
        return next(err);
      });
    }
  });
}
