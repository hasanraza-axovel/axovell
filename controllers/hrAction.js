var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var moment = require('moment');
var bcrypt = require('bcrypt-nodejs');
var db = require('../models');
var json2csv = require('json2csv');
var fs = require('fs');

var async = require('async');


module.exports = {
  addEmpDetail: addEmpDetail,
  editEmpDetail: editEmpDetail,
  getEmpDetail: getEmpDetail,

  listEmp: listEmp,
  deleteEmp: deleteEmp,
  createCsv: createCsv,
  bluckDeleteEmp:bluckDeleteEmp,
  addDevice:addDevice
}


function addEmpDetail(req, res, next) {
  if(req.body.profile_pic !== undefined) {
    var profile_pic = req.body.profile_pic;
    req.body.profile_pic = req.body.profile_pic.substring(req.body.profile_pic.indexOf(";base64,")+";base64".length+1);
  }
  var rows = [];
  // var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  checkDoc = false;
  if(req.body.doc !== undefined && req.body.doc_name !== undefined) {
    if((req.body.doc.constructor !== Array && req.body.doc_name.constructor === Array)||
        (req.body.doc.constructor === Array && req.body.doc_name.constructor !== Array)) {
          checkDoc = true;
        }
      }

  if(checkDoc) {
    res.status(422)
      .json({
        status: 'exception',
        message: 'Document is not valid OR no of document is not equal to no of doc name'
      });
  }

else{
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
      'username': {notEmpty: true, errorMessage: 'Username is required'},
      'password': {notEmpty: true, errorMessage: 'Password is required'},
      'profile_pic': {
        notEmpty: true,
        isBase64: {
          errorMessage: 'Profile pic is not valid'
        },
        errorMessage: 'Profile pic is required'
      },
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
      'cur_country': {notEmpty: true, errorMessage: 'Current country is required'},
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
      'per_country': {notEmpty: true, errorMessage: 'Permanent country is required'},
      'laptop_no': {notEmpty: true, errorMessage: 'Laptop No. is required'},
      'mouse_no': {notEmpty: true, errorMessage: 'Mouse No. is required'},
      'keyboard_no': {notEmpty: true, errorMessage: 'Keyboard No is required'}
    });

    if(typeof req.body.leaving_date !== 'undefined') {
      req.checkBody('leaving_date', 'Not a valid date').isDate();
    }
    if(typeof req.body.HR_no !== 'undefined') {
      req.checkBody('HR_no', 'HR no must contain only digit').matches(/^[0-9]*$/, "i");
    }
    if(typeof req.body.TL_no !== 'undefined') {
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
              user_roleId: userRole.id,
              username: req.body.username,
              email: req.body.email,
              password: hash,
              profile_pic: profile_pic
            },{
              fields: ['user_roleId', 'username', 'email', 'password', 'profile_pic']
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
                  employee_roleId: employee_role.id,
                  userId: user.id
                },{
                  fields: ['emp_fname', 'emp_lname', 'join_date', 'status',
                         'mob_no', 'emergency_cont_no', 'emergency_cont_person',
                         'service_cont_end', 'email', 'password', 'employee_roleId',
                         'userId']
                }).then(function(employee) {
                  db.emp_device.create({
                    employeeId: employee.id,
                    laptop_no: req.body.laptop_no,
                    mouse_no: req.body.mouse_no,
                    keyboard_no: req.body.keyboard_no
                  },{
                    fields: ['employeeId', 'laptop_no', 'mouse_no', 'keyboard_no']
                  }).then(function(empDevice) {
                    db.emp_permnt_addr.create({
                      employeeId: employee.id,
                      address: req.body.per_address,
                      city: req.body.per_city,
                      pincode: req.body.per_pincode,
                      country: req.body.per_country
                    },{
                      fields: ['employeeId', 'address', 'city', 'pincode', 'country']
                    }).then(function(empPermntAddrs) {
                      db.emp_current_addr.create({
                        employeeId: employee.id,
                        address: req.body.cur_address,
                        city: req.body.cur_city,
                        pincode: req.body.cur_pincode,
                        country: req.body.cur_country
                      },{
                        fields: ['employeeId', 'address', 'city', 'pincode', 'country']
                      }).then(function(empCurrentAddrs) {
                        db.prev_employer_detaile.create({
                          employeeId: employee.id,
                          company_name: req.body.company_name,
                          leaving_date: req.body.leaving_date,
                          CTC: req.body.ctc,
                          HR_no: req.body.HR_no,
                          TL_no: req.body.TL_no
                        }).then(function(prevEmpDetaile) {


                          if(req.body.doc !== undefined) {
                            if(req.body.doc.constructor === Array) {

                              for(var i=0; i<req.body.doc.length; i++) {
                                rows.push({
                                  employeeId: employee.id,
                                  doc_name: req.body.doc_name[i],
                                  doc_path: req.body.doc[i]
                                });
                              }
                            }

                          else {
                            rows.push({
                              employeeId: employee.id,
                              doc_name: req.body.doc_name,
                              doc_path: req.body.doc
                            });
                          }
                        }
                          db.document.bulkCreate(rows,{fields: ['employeeId', 'doc_name', 'doc_path']})
                          .then(function(documents) {
                            return res.status(200)
                              .json({
                                status: 'success',
                                data: {
                                  id: user.id
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
}

function editEmpDetail(req, res, next) {
  if(req.body.profile_pic !== undefined) {
    var profile_pic = req.body.profile_pic;
    req.body.profile_pic = req.body.profile_pic.substring(req.body.profile_pic.indexOf(";base64,")+";base64".length+1);
  }
  var rows = [];
  // var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  checkDoc = false;
  if(req.body.doc !== undefined && req.body.doc_name !== undefined) {
    if((req.body.doc.constructor !== Array && req.body.doc_name.constructor === Array)||
        (req.body.doc.constructor === Array && req.body.doc_name.constructor !== Array)) {
          checkDoc = true;
        }
      }

  if(checkDoc) {
    res.status(422)
      .json({
        status: 'exception',
        message: 'Document is not valid OR no of document is not equal to no of doc name'
      });
  }

else{
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
      'username': {notEmpty: true, errorMessage: 'Username is required'},
      'password': {notEmpty: true, errorMessage: 'Password is required'},
      'profile_pic': {
        notEmpty: true,
        isBase64: {
          errorMessage: 'Profile pic is not valid'
        },
        errorMessage: 'Profile pic is required'
      },
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
      'cur_country': {notEmpty: true, errorMessage: 'Current country is required'},
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
      'per_country': {notEmpty: true, errorMessage: 'Permanent country is required'},
      'laptop_no': {notEmpty: true, errorMessage: 'Laptop No. is required'},
      'mouse_no': {notEmpty: true, errorMessage: 'Mouse No. is required'},
      'keyboard_no': {notEmpty: true, errorMessage: 'Keyboard No is required'}
    });
    req.checkBody('emp_user_id', "employee's user Id is required").notEmpty();
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

        db.user.findOne({
          where: {
            id: req.body.emp_user_id
          }
        }).then(function(user) {
          if(user) {
            db.user.update({
              username: req.body.username,
              email: req.body.email,
              password: hash,
              profile_pic: profile_pic
            },{
              where: {id: req.body.emp_user_id},
            }).then(function(user) {
              db.employee.findOne({
                where: {
                  userId: req.body.emp_user_id
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
                    employee_roleId: employeeRole.id
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
                        employeeId: employee.id
                      }
                    }).then(function(empDevice){
                      db.emp_current_addr.update({
                        address: req.body.cur_address,
                        city: req.body.cur_city,
                        pincode: req.body.cur_pincode,
                        country: req.body.cur_country
                      },{
                        where: {
                          employeeId: employee.id
                        }
                      }).then(function(empCurrentAddrs) {
                        db.emp_permnt_addr.update({
                          address: req.body.per_address,
                          city: req.body.per_city,
                          pincode: req.body.per_pincode,
                          country: req.body.per_country
                        }, {
                          where: {
                            employeeId: employee.id
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
                              employeeId: employee.id
                            }
                          }).then(function(prevEmpDetaile) {
                            if(req.body.doc !== undefined && req.body.doc_name !== undefined) {
                              if(req.body.doc.constructor === Array) {

                                for(var i=0; i<req.body.doc.length; i++) {
                                  rows.push({
                                    employeeId: employee.id,
                                    doc_name: req.body.doc_name[i],
                                    doc_path: req.body.doc[i]
                                    });
                                  }
                                }

                                else {
                                  rows.push({
                                    employeeId: employee.id,
                                    doc_name: req.body.doc_name,
                                    doc_path: req.body.doc
                                    });
                                }
                              }
                          db.document.bulkCreate(rows,{fields: ['employeeId', 'doc_name', 'doc_path']})
                          .then(function(result) {
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
              userId: user.id
            }
          }).then(function(employee) {
            db.employee_role.findOne({
              where: {
                id: employee.employee_roleId
              }
            }).then(function(employeeRole) {
              db.emp_current_addr.findOne({
                where: {
                  employeeId: employee.id
                }
              }).then(function(empCurrentAddrs) {
                db.emp_permnt_addr.findOne({
                  where: {
                    employeeId: employee.id
                  }
                }).then(function(empPermntAddrs) {
                  db.prev_employer_detaile.findOne({
                    where: {
                      employeeId: employee.id
                    }
                  }).then(function(prevEmpDetaile) {
                    db.emp_device.findOne({
                      where: {
                        employeeId: employee.id
                      }
                    }).then(function(empDevice) {
                      db.document.findAll({
                        where: {
                          employeeId: employee.id
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
                              userId: user.id,
                              employee_role: employeeRole.role,
                              laptop_no: empDevice.laptop_no,
                              mouse_no: empDevice.mouse_no,
                              keyboard_no: empDevice.keyboard_no,
                              per_address: empPermntAddrs.address,
                              per_city: empPermntAddrs.city,
                              per_pincode: empPermntAddrs.pincode,
                              per_country: empPermntAddrs.country,
                              cur_address: empCurrentAddrs.address,
                              cur_city: empCurrentAddrs.city,
                              cur_pincode: empCurrentAddrs.pincode,
                              cur_country: empCurrentAddrs.country,
                              company_name: prevEmpDetaile.company_name,
                              leaving_date: prevEmpDetaile.leaving_date,
                              CTC: prevEmpDetaile.CTC,
                              HR_no: prevEmpDetaile.HR_no,
                              TL_no: prevEmpDetaile.TL_no,
                              profile_pic: user.profile_pic,
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
  req.checkBody('user_id', 'user id is required').notEmpty();
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
        for(var i=0; i<data.length; i++) {
          roleIds[i] = data[i].id;
        }
        db.user.findOne({
          where: {
            id: req.body.user_id
          }
        }).then(function(user) {
          if(user && !roleIds.includes(user.user_roleId)) {
            return res.status(401)
              .json({
                status: 'exception',
                message:  'Unauthorized Access!'
              });
            }
            else if(user) {
              db.employee.findAll({
                include: [
                  { model: db.employee_role,
                    as: 'employeeRole'}
                ],
                order: [
                  ['createdAt', 'DESC']
              ],
            attributes: ['emp_fname','emp_lname', 'join_date', 'status', 'mob_no', 'emergency_cont_person', 'emergency_cont_no', 'service_cont_end', 'email','userId']
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
function createCsv(req, res, next) {
  req.checkBody('user_id', 'user id is required').notEmpty();
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
        for(var i=0; i<data.length; i++) {
          roleIds[i] = data[i].id;
        }
        db.user.findOne({
          where: {
            id: req.body.user_id
          }
        }).then(function(user) {
          if(user && !roleIds.includes(user.user_roleId)) {
            return res.status(401)
              .json({
                status: 'exception',
                message:  'Unauthorized Access!'
              });
            }
            else if(user) {
              db.employee.findAll({
                include: [
                  { model: db.employee_role,
                    as: 'employeeRole'},
                    {
                      model: db.emp_device,
                      as: 'empDevice'
                    },
                    {
                      model: db.emp_current_addr,
                      as: 'empCurrentAddrs'
                    },
                    {
                      model: db.emp_permnt_addr,
                      as: 'empPermntAddrs'
                    },
                    {
                      model: db.prev_employer_detaile,
                      as: 'prevEmpDetaile'
                    }
                ],
                order: [
                  ['createdAt', 'DESC']
              ],
            attributes: ['emp_fname','emp_lname', 'join_date', 'status', 'mob_no',
            'emergency_cont_person', 'emergency_cont_no', 'service_cont_end', 'email','userId'
              ]
            }).then(function(data) {
              var fields = ['emp_fname','emp_lname', 'join_date', 'status', 'mob_no',
              'emergency_cont_person', 'emergency_cont_no', 'service_cont_end', 'email','userId',
              'employeeRole.role', 'empDevice.laptop_no', 'empDevice.mouse_no', 'empDevice.keyboard_no',
              'empCurrentAddrs.address', 'empCurrentAddrs.city', 'empCurrentAddrs.pincode', 'empCurrentAddrs.country',
              'empPermntAddrs.address', 'empPermntAddrs.city', 'empPermntAddrs.pincode', 'empPermntAddrs.country',
              'prevEmpDetaile.company_name', 'prevEmpDetaile.leaving_date', 'prevEmpDetaile.CTC', 'prevEmpDetaile.HR_no',
            'prevEmpDetaile.TL_no'];
              var csv = json2csv({data: data, fields: fields});
              fs.writeFile('./public/files/file.csv', csv, function(err) {
                if(err) throw err;
                console.log('file saved');
                return res.status(200)
                  .json({
                    status: 'success',
                    data: 'http://192.241.153.62:1223/files/file.csv',
                    message: 'Csv file created'
                  });
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

function deleteEmp(req, res, next) {
  req.checkBody('emp_user_id', 'employee userId is required').notEmpty();
  req.checkBody('user_id', 'employee userId is required').notEmpty();
  req.getValidationResult().then(function(result) {
    if(!result.isEmpty()) {
      res.status(422)
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
        }
      }).then(function(data) {
        var roleIds = [];
        for(var i=0; i<data.length; i++) {
          roleIds[i] = data[i].id;
        }
        db.user.findOne({
          where: {
            id: req.body.user_id
          }
        }).then(function(user) {
          if(user && !roleIds.includes(user.user_roleId)) {
            return res.status(401)
              .json({
                status: 'exception',
                message:  'Unauthorized Access!'
              });
            }
          else if(user) {
            db.employee.findOne({
              where: {
                userId: req.body.emp_user_id
              },
              attributes: ['id','emp_fname','emp_lname', 'join_date', 'status', 'mob_no',
              'emergency_cont_person', 'emergency_cont_no', 'service_cont_end', 'email','userId'
                ]
            }).then(function(employee) {
              if(employee) {
                db.document.destroy({
                  where: {
                    employeeId: employee.id
                  }
                }).then(function(result) {
                  db.emp_current_addr.destroy({
                    where: {
                      employeeId: employee.id
                    }
                  }).then(function(result) {
                    db.emp_device.destroy({
                      where: {
                        employeeId: employee.id
                      }
                    }).then(function(result) {
                      db.emp_permnt_addr.destroy({
                        where: {
                          employeeId: employee.id
                        }
                      }).then(function(result) {
                        db.prev_employer_detaile.destroy({
                          where: {
                            employeeId: employee.id
                          }
                        }).then(function(result) {
                          db.employee.destroy({
                            where: {
                              id: employee.id
                            }
                          }).then(function(result) {
                            db.user.destroy({
                              where: {
                                id: req.body.emp_user_id
                              }
                            }).then(function(result) {
                              res.status(200)
                                .json({
                                  status: 'success',
                                  message: 'Employee deleted succesfully'
                                });
                            }).catch(function(err) {
                              return next(err);
                            });
                          }).catch(function(err) {
                            return next(err);
                          })
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
                res.status(422)
                  .json({
                    status: 'exception',
                    message: 'Employee does not found'
                  });

              }
            }).catch(function(err) {
              return next(err);
            });
          }
          else {
            res.status(422)
              .json({
                status: 'exception',
                message: 'User does not found'
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

function addDevice(req, res, next){
    req.checkBody({
      'device_no': {notEmpty: true, errorMessage: 'device No. is required'},
      'device_name':{notEmpty: true, errorMessage: 'device Name. is required'},
      'device_code':{notEmpty: true, errorMessage: 'device Code. is required'},
      'device_company':{notEmpty: true, errorMessage: 'device Code. is required'},
      'charger':{notEmpty: true, errorMessage: 'charger is required'},
      'bag':{notEmpty: true, errorMessage: 'charger is required'},
      'mouse':{notEmpty: true, errorMessage: 'mouse is required'},
      'keyboard':{notEmpty: true, errorMessage: 'keyboard is required'},
      'assign_status':{notEmpty: true, errorMessage: 'assign_status is required'},
    });
    req.getValidationResult().then(function(result) {
      if(!result.isEmpty()) {
        res.status(422)
          .json({
            status: 'exception',
            data: result.array(),
            message: 'Validation Failed'
          });
      }
      else{
        db.device.create({
          device_no: req.body.device_no,
          device_name: req.body.device_name,
          device_code: req.body.device_code,
          device_company: req.body.device_company,
          charger: req.body.charger,
          mouse:req.body.mouse,
          bag:req.body.bag,
          keyboard:req.body.keyboard,
          assign_status:req.body.assign_status,
        },{
          fields: ['device_no', 'device_name', 'device_code','device_company','bag','mouse', 'charger','keyboard','assign_status']
        }).then(function(device) {
          return res.status(200)
          .json({
          status: 'success',
          data: {
          // id: user.id
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
      }
    });
}
function bluckDeleteEmp(req, res, next) {
  req.checkBody('emp_user_id', 'employee userId is required').notEmpty();
  req.checkBody('user_id', 'employee userId is required').notEmpty();
  req.getValidationResult().then(function(result) {
    if(!result.isEmpty()) {
      res.status(422)
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
        }
      }).then(function(data) {
        var roleIds = [];
        for(var i=0; i<data.length; i++) {
          roleIds[i] = data[i].id;
        }
        db.user.findOne({
          where: {
            id: req.body.user_id
          }
        }).then(function(user) {
          if(user && !roleIds.includes(user.user_roleId)) {
            return res.status(401)
              .json({
                status: 'exception',
                message:  'Unauthorized Access!'
              });
            }
          else if(user) {
            db.employee.findOne({
              where: {
                userId: req.body.emp_user_id
              },
              attributes: ['id','emp_fname','emp_lname', 'join_date', 'status', 'mob_no',
              'emergency_cont_person', 'emergency_cont_no', 'service_cont_end', 'email','userId'
                ]
            }).then(function(employee) {
              if(employee) {
                db.document.destroy({
                  where: {
                    employeeId: employee.id
                  }
                }).then(function(result) {
                  db.emp_current_addr.destroy({
                    where: {
                      employeeId: employee.id
                    }
                  }).then(function(result) {
                    db.emp_device.destroy({
                      where: {
                        employeeId: employee.id
                      }
                    }).then(function(result) {
                      where: {
                        employeeId: employee.id
                      }
                    }).then(function(result) {
                      db.emp_permnt_addr.destroy({
                        where: {
                          employeeId: employee.id
                        }
                      }).then(function(result) {
                        db.prev_employer_detaile.destroy({
                          where: {
                            employeeId: employee.id
                          }
                        }).then(function(result) {
                          db.employee.destroy({
                            where: {
                              id: employee.id
                            }
                          }).then(function(result) {
                            db.user.destroy({
                              where: {
                                id: req.body.emp_user_id
                              }
                            }).then(function(result) {
                              res.status(200)
                                .json({
                                  status: 'success',
                                  message: 'Employee deleted succesfully'
                                });
                            }).catch(function(err) {
                              return next(err);
                            });
                          }).catch(function(err) {
                            return next(err);
                          })
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
                res.status(422)
                  .json({
                    status: 'exception',
                    message: 'Employee does not found'
                  });

              }
            }).catch(function(err) {
              return next(err);
            });
          }
          else {
            res.status(422)
              .json({
                status: 'exception',
                message: 'User does not found'
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
// function createPdf(req, res, next) {
//
//   console.log('pdf creating');
//
// pdf = new PDFKit('html', '<h1>Hello</h1>');
//
// console.log('gooogle');
//
// pdf.toFile('google.pdf', function (err, file) {
//   console.log('File ' + file + ' written');
//   res.status(200)
//   .json({
//     message: 'ok'
//   });
// });
//
// }
