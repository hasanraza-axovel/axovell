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
    'keyboard_no': {notEmpty: true, errorMessage: 'Keyboard No is required'}
  });

  if(req.body.leaving_date) {
    req.checkBody('leaving_date', 'Not a valid date').isDate();
  }
  if(req.body.HR_no) {
    req.checkBody('HR_no', 'HR no must contain only digit').matches(/^[0-9]*$/, "i");
  }
  if(req.body.TL_no) {
    req.checkBody('TL_no', 'TL no must contain only digit').matches(/^[0-9]*$/, "i");
  }

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
  req.checkBody('emp_user_id', "employee's user Id is required").notEmpty();
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
      db.user.findOne({
        where: {
          id: req.body.emp_user_id
        }
      }).then(function(user) {
        if(user){
          db.employee.findOne({
            where: {
              user_id: user.id
            }
          }).then(function(employee) {
            db.employee_role.findOne({
              where: {
                id: employee.emp_role_id
              }
            }).then(function(employeeRole) {
              db.emp_current_addr.findOne({
                where: {
                  emp_id: employee.id
                }
              }).then(function(empCurrentAddrs) {
                db.emp_permnt_addr.findOne({
                  where: {
                    emp_id: employee.id
                  }
                }).then(function(empPermntAddrs) {
                  db.prev_employer_detaile.findOne({
                    where: {
                      emp_id: employee.id
                    }
                  }).then(function(prevEmpDetaile) {
                    db.emp_device.findOne({
                      where: {
                        emp_id: employee.id
                      }
                    }).then(function(empDevice) {
                      db.document.findAll({
                        where: {
                          emp_id: employee.id
                        }
                      }).then(function(document) {
                        res.status(200)
                          .json({
                            status: 'success',
                            data: {
                              emp_fname: employee.emp_fname,
                              emp_lname: employee.emp_lname,
                              join_date: employee.join_date,
                              status: employee.status,
                              mob_no: employee.mob_no,
                              emergency_cont_no: employee.emergency_cont_no,
                              emergency_cont_person: employee.emergency_cont_person,
                              service_cont_end: employee.service_cont_end,
                              email: employee.email,
                              username: user.username,
                              employee_role: employeeRole.role,
                              laptop_no: empDevice.laptop_no,
                              mouse_no: empDevice.mouse_no,
                              keyboard_no: empDevice.keyboard_no,
                              per_address: empPermntAddrs.address,
                              per_city: empPermntAddrs.city,
                              per_pincode: empPermntAddrs.pincode,
                              cur_address: empCurrentAddrs.address,
                              cur_city: empCurrentAddrs.city,
                              cur_pincode: empCurrentAddrs.pincode,
                              company_name: prevEmpDetaile.company_name,
                              leaving_date: prevEmpDetaile.leaving_date,
                              CTC: prevEmpDetaile.ctc,
                              HR_no: prevEmpDetaile.HR_no,
                              TL_no: prevEmpDetaile.TL_no,
                              doc: document
                            },
                            message: "Employee's data found"
                          });
                      }).catch(function(err) {
                        return next(err);
                      });
                    }).catch(function(err) {
                      return next(err);
                    });
                  }).catch(function(err) {
                    return next(err);
                  });
                }).catch(function(err) {
                  return next(err);
                });
              }).catch(function(err) {
                return next(err);
              });
            }).catch(function(err) {
              return next(err);
            });
          }).catch(function(err) {
            return next(err);
          });
        }
        else {
          res.status(404)
            .json({
              status: 'exception',
              message: 'employee not found'
            });
        }
      }).catch(function(err){
        return next(err);
      });
    }
  });
}

function listEmp(req, res, next) {
  req.checkBody('user_id', 'userId is required').notEmpty();
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
        var roleIds = [];
        console.log(data[0].id);
        for(var i=0; i<data.length; i++) {
          roleIds[i] = data[i].id;
        }
        console.log(roleIds);
        db.user.findOne({
          where: {
            id: req.body.user_id
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
                //   { model: db.employee_role}
                // ],
                order: [
                  ['createdAt', 'DESC']
              ],
              attributes: ['id','emp_fname','emp_lname', 'join_date', 'status', 'mob_no', 'emergency_cont_person', 'emergency_cont_no', 'service_cont_end', 'email']
            }).then(function(data) {
              return res.status(200)
                .json({
                  status: 'success',
                  data: data,
                  message: data.length + ' employees found'
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
