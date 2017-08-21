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
  editEmpDetail: editEmpDetail,
  getEmpDetail: getEmpDetail,

  listEmp: listEmp
}


function addEmpDetail(req, res, next) {
  var docs = [];
  var rows = [];
  for(var i=0; i<req.body.doc.length; i++) {
    if(typeof req.body.doc[i] != 'undefined') {
      docs[i] = req.body.doc[i];
      req.body.doc[i] = req.body.doc[i].substring(req.body.doc[i].indexOf(";base64,") + ";base64,".length+1);
    }
  }

  req.checkBody({
    'first_name': {
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
    'last_name': {
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
    'join_date': {
      notEmpty: true,
      isDate: {
        errorMessage: 'Not a valid date'
      },
      errorMessage: 'join Date is required'
    },
    'status' : {
      notEmpty: true,
      errorMessage: 'status is required',
      isBoolean: {
        errorMessage: 'status value must be boolean type'
      }
    },
    'mob_no': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'Mobile no must contain only digit'
      },
      isLength: {
        options: [{ min: 10, max: 10 }],
        errorMessage: 'Mobile number must be 10 digit long'
      },
      errorMessage: 'mobile no is require'
    },
    'service_cont_end': {
      notEmpty: true,
      isDate: {
        errorMessage: 'Not a valid date'
      },
      errorMessage: 'service_cont_end is required'
    },
    'emp_role': {notEmpty: true, errorMessage: 'employee role id is required'},
    // 'user_id': {notEmpty: true, errorMessage: 'user id is required'},
    'username': {notEmpty: true, errorMessage: 'Username is required'},
    'password': {notEmpty: true, errorMessage: 'Password is required'},
    'emergency_cont_no': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'emergency contact number must contain only digit'
      },
      errorMessage: 'Emergency contact number is required'
    },
    'emergency_cont_person': {notEmpty: true, errorMessage: 'Emergency contact Person is required'},
    'cur_address': {notEmpty: true, errorMessage: 'Current Address is required'},
    'cur_city': {notEmpty: true, errorMessage: 'Current City is required'},
    'cur_pincode': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'Pincode must contain only digit'
      },
      isLength: {
        options: [{ min: 6, max: 6 }],
        errorMessage: 'Pincode must be 6 digit long'
      },
      errorMessage: 'Current Pincode is required'
    },
    'per_city': {notEmpty: true, errorMessage: 'Permanent City is required'},
    'per_address': {notEmpty: true, errorMessage: 'Permanent Address is required'},
    'per_pincode': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'Pincode must contain only digit'
      },
      isLength: {
        options: [{ min: 6, max: 6 }],
        errorMessage: 'Pincode must be 6 digit long'
      },
      errorMessage: 'Permanent Code is required'
    },
    'laptop_no': {notEmpty: true, errorMessage: 'Laptop No. is required'},
    'mouse_no': {notEmpty: true, errorMessage: 'Mouse No. is required'},
    'keyboard_no': {notEmpty: true, errorMessage: 'Keyboard No is required'},
    'leaving_date': {
      isDate: {
        errorMessage: 'Not a valid date'
      }
    },
    'ctc': {notEmpty: true, errorMessage: 'CTC is required'},
    'HR_no': {
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'HR no must contain only digit'
      }
    },
    'TL_no': {
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'TL no must contain only digit'
      }
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
          }).then(function(user) {
            db.employee_role.findOne({
              where: {
                role: req.body.emp_role
              }
            }).then(function(employee_role) {

              db.employee.create({
                emp_fname: req.body.first_name,
                emp_lname: req.body.last_name,
                join_date: req.body.join_date,
                status: req.body.status,
                mob_no: req.body.mob_no,
                emergency_cont_no: req.body.emergency_cont_no,
                emergency_cont_person: req.body.emergency_cont_person,
                service_cont_end: req.body.service_cont_end,
                email: req.body.email,
                password: hash,
                emp_role_id: employee_role.id,
                user_id: user.id
              },{
                fields: ['emp_fname', 'emp_lname', 'join_date', 'status',
                       'mob_no', 'emergency_cont_no', 'emergency_cont_person',
                       'service_cont_end', 'email', 'password', 'emp_role_id',
                       'user_id']
              }).then(function(employee) {
                db.emp_device.create({
                  emp_id: employee.id,
                  laptop_no: req.body.laptop_no,
                  mouse_no: req.body.mouse_no,
                  keyboard_no: req.body.keyboard_no
                },{
                  fields: ['emp_id', 'laptop_no', 'mouse_no', 'keyboard_no']
                }).then(function(empDevice) {
                  db.emp_permnt_addr.create({
                    emp_id: employee.id,
                    address: req.body.per_address,
                    city: req.body.per_city,
                    pincode: req.body.per_pincode
                  },{
                    fields: ['emp_id', 'address', 'city', 'pincode']
                  }).then(function(empPermntAddrs) {
                    db.emp_current_addr.create({
                      emp_id: employee.id,
                      address: req.body.cur_address,
                      city: req.body.cur_city,
                      pincode: req.body.cur_pincode
                    }).then(function(empCurrentAddrs) {
                      db.prev_employer_detaile.create({
                        emp_id: employee.id,
                        company_name: req.body.company_name,
                        leaving_date: req.body.leaving_date,
                        CTC: req.body.ctc,
                        HR_no: req.body.HR_no,
                        TL_no: req.body.TL_no
                      }).then(function(prevEmpDetaile) {
                        for(var i=0; i<docs.length; i++) {
                          rows.push({
                            emp_id: employee.id,
                            doc_name: req.body.doc_name[i],
                            doc_path: req.body.doc[i]
                          });
                        }

                        // console.log(req.body.doc[0]);
                        db.document.bulkCreate(rows,{fields: ['emp_id', 'doc_name', 'doc_path']})
                        .then(function(documents) {
                          return res.status(200)
                            .json({
                              status: 'success',
                              data: {
                                id: employee.id
                              },
                              message: 'Data saved successfully'
                            });
                        }).catch(Sequelize.ValidationError, function(err) {
                          res.status(422)
                            .json({
                              status: 'exception',
                              data: err.errors,
                              message: 'Validation Failed'
                            });
                        }).catch(function(err) {
                          return next(err);
                        });
                      }).catch(Sequelize.ValidationError, function(err) {
                        res.status(422)
                          .json({
                            status: 'exception',
                            data: err.errors,
                            message: 'Validation Failed'
                          });
                      }).catch(function(err) {
                        return next(err);
                      });

                    }).catch(Sequelize.ValidationError, function(err) {
                      res.status(422)
                        .json({
                          status: 'exception',
                          data: err.errors,
                          message: 'Validation Failed'
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

function editEmpDetail(req, res, next) {
  req.checkBody({
    'first_name': {
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
    'last_name': {
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
    'join_date': {
      notEmpty: true,
      isDate: {
        errorMessage: 'Not a valid date'
      },
      errorMessage: 'join Date is required'
    },
    'status' : {
      notEmpty: true,
      errorMessage: 'status is required',
      isBoolean: {
        errorMessage: 'status value must be boolean type'
      }
    },
    'mob_no': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'Mobile no must contain only digit'
      },
      isLength: {
        options: [{ min: 10, max: 10 }],
        errorMessage: 'Mobile number must be 10 digit long'
      },
      errorMessage: 'mobile no is require'
    },
    'service_cont_end': {
      notEmpty: true,
      isDate: {
        errorMessage: 'Not a valid date'
      },
      errorMessage: 'service_cont_end is required'
    },
    'emp_role': {notEmpty: true, errorMessage: 'employee role id is required'},
    // 'user_id': {notEmpty: true, errorMessage: 'user id is required'},
    'username': {notEmpty: true, errorMessage: 'Username is required'},
    'password': {notEmpty: true, errorMessage: 'Password is required'},
    'emergency_cont_no': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'emergency contact number must contain only digit'
      },
      errorMessage: 'Emergency contact number is required'
    },
    'emergency_cont_person': {notEmpty: true, errorMessage: 'Emergency contact Person is required'},
    'cur_address': {notEmpty: true, errorMessage: 'Current Address is required'},
    'cur_city': {notEmpty: true, errorMessage: 'Current City is required'},
    'cur_pincode': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'Pincode must contain only digit'
      },
      isLength: {
        options: [{ min: 6, max: 6 }],
        errorMessage: 'Pincode must be 6 digit long'
      },
      errorMessage: 'Current Pincode is required'
    },
    'per_city': {notEmpty: true, errorMessage: 'Permanent City is required'},
    'per_address': {notEmpty: true, errorMessage: 'Permanent Address is required'},
    'per_pincode': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'Pincode must contain only digit'
      },
      isLength: {
        options: [{ min: 6, max: 6 }],
        errorMessage: 'Pincode must be 6 digit long'
      },
      errorMessage: 'Permanent Code is required'
    },
    'laptop_no': {notEmpty: true, errorMessage: 'Laptop No. is required'},
    'mouse_no': {notEmpty: true, errorMessage: 'Mouse No. is required'},
    'keyboard_no': {notEmpty: true, errorMessage: 'Keyboard No is required'},
    'doc': {
      notEmpty: true,
      // isBase64: {
      //   errorMessage: 'Not a valid document'
      // },
      errorMessage: 'Document is required'
    },
    'doc_name': {notEmpty: true, errorMessage: 'Document name is required'},
    'company_name': {notEmpty: true, errorMessage: 'Company name is required'},
    'leaving_date': {
      notEmpty: true,
      isDate: {
        errorMessage: 'Not a valid date'
      },
      errorMessage: 'Leaving Date is required'
    },
    'ctc': {notEmpty: true, errorMessage: 'CTC is required'},
    'HR_no': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'HR no must contain only digit'
      },
      errorMessage: 'HR no. is required'
    },
    'TL_no': {
      notEmpty: true,
      matches: {
        options: [/^[0-9]*$/i],
        errorMessage: 'TL no must contain only digit'
      },
      errorMessage: 'TL no is required'
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
      bcrypt.hash(req.body.password, null, null, function(err, hash) {
        if(err) return next(err);

        db.user.findOne({
          where: {
            id: req.body.user_id
          }
        }).then(function(user) {
          if(user) {
            db.user.update({
              username: req.body.username,
              email: req.body.email,
              password: hash
            },{
              where: {id: req.body.user_id},
            }).then(function(user) {
              db.employee.findOne({
                where: {
                  user_id: req.body.user_id
                }
              }).then(function(employee) {
                db.employee_role.findOne({
                  where: {
                    role: req.body.emp_role
                  }
                }).then(function(employeeRole){
                  db.employee.update({
                    emp_fname: req.body.first_name,
                    emp_lname: req.body.last_name,
                    join_date: req.body.join_date,
                    status: req.body.status,
                    mob_no: req.body.mob_no,
                    emergency_cont_no: req.body.emergency_cont_no,
                    emergency_cont_person: req.body.emergency_cont_person,
                    service_cont_end: req.body.service_cont_end,
                    email: req.body.email,
                    password: hash,
                    emp_role_id: employeeRole.id
                  },{
                    where: {
                      id: employee.id
                    }
                  }).then(function(data) {
                    db.emp_device.update({
                      laptop_no: req.body.laptop_no,
                      mouse_no: req.body.mouse_no,
                      keyboard_no: req.body.keyboard_no
                    }, {
                      where: {
                        emp_id: employee.id
                      }
                    }).then(function(empDevice){
                      db.emp_current_addr.update({
                        address: req.body.per_address,
                        city: req.body.per_city,
                        pincode: req.body.per_pincode
                      },{
                        where: {
                          emp_id: employee.id
                        }
                      }).then(function(empCurrentAddrs) {
                        db.emp_permnt_addr.update({
                          address: req.body.per_address,
                          city: req.body.per_city,
                          pincode: req.body.per_pincode
                        }, {
                          where: {
                            emp_id: employee.id
                          }
                        }).then(function(empPermntAddrs) {
                          db.prev_employer_detaile.update({
                            company_name: req.body.company_name,
                            leaving_date: req.body.leaving_date,
                            CTC: req.body.ctc,
                            HR_no: req.body.HR_no,
                            TL_no: req.body.TL_no
                          },{
                            where: {
                              emp_id: employee.id
                            }
                          }).then(function(prevEmpDetaile) {
                            var promises = [];
                            for(var i=0; i<req.body.doc.length; i++) {
                              var newPromise = db.document.update({
                                doc_path: req.body.doc[i]
                              },{
                                where: {
                                  doc_name: req.body.doc_name[i],
                                  emp_id: employee.id
                                }
                              });
                              promises.push(newPromise);
                            };
                            return Promise.all(promises).then(function(documents) {
                              var docPromises = [];
                              for(var i=0; i<documents.length; i++) {
                                docPromises.push(documents[i].dataValues);
                              }
                            }).then(function(result) {
                              return res.status(200)
                                .json({
                                  status: 'success',
                                  message: 'employee updated'
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
                            return next(err)
                          });
                        }).catch(Sequelize.ValidationError, function(err) {
                          return res.status(422)
                            .json({
                              status: 'exception',
                              data: err.errors,
                              message: 'Validation Failed'
                            });
                        }).catch(function(err) {
                          return next(err)
                        });
                      }).catch(Sequelize.ValidationError, function(err) {
                        return res.status(422)
                          .json({
                            status: 'exception',
                            data: err.errors,
                            message: 'Validation Failed'
                          });
                      }).catch(function(err) {
                        return next(err)
                      });
                    }).catch(Sequelize.ValidationError, function(err) {
                      return res.status(422)
                        .json({
                          status: 'exception',
                          data: err.errors,
                          message: 'Validation Failed'
                        });
                    }).catch(function(err) {
                      return next(err)
                    });
                  }).catch(Sequelize.ValidationError, function(err) {
                    return res.status(422)
                      .json({
                        status: 'exception',
                        data: err.errors,
                        message: 'Validation Failed'
                      });
                  }).catch(function(err) {
                    return next(err)
                  });
                }).catch(function(err) {
                  return next(err);
                })
              }).catch(function(err) {
                return next(err);
              })
            }).catch(Sequelize.ValidationError, function(err){
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
          else{
            return res.status(404)
              .json({
                status: 'exception',
                message: 'employee does not found'
              });
          }
        }).catch(function(err) {
          return next(err);
        });
      });
    }
  });

}

function getEmpDetail(req, res, next) {


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
