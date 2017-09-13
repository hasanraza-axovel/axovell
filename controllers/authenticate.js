var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var async = require('async');
var moment = require('moment');

var bcrypt = require('bcrypt-nodejs');

const nodemailer = require('nodemailer');
var jwt = require('jwt-simple');
var db = require('../models');
var ejs = require('ejs');
// var connection = require('../config/dbconnection');

var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "2b06e5f1a29881",
    pass: "f44c5f4ad55c4c"
  }
});

module.exports = {
  signUp: signUp,
  login: login,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword
}

function signUp(req, res, next) {
  req.checkBody({
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      },
      errorMessage: 'Email is required'
    },
    'username': {notEmpty: true, errorMessage: 'username is required'},
    'user_role': {notEmpty: true, errorMessage: 'user_role is required'},

    'password': {notEmpty: true, errorMessage: 'Password is required'},
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
        // if error occurs
        if (err) return next(err);

        db.user_role.findOne({
          where: {
            role: req.body.user_role
          }
        }).then(function(userRole) {
          //create new record for user
          db.user.create({
            user_role_id: userRole.id,
            password: hash,
            username: req.body.username,
            email: req.body.email,
          }, {
            fields: ['user_role_id', 'password', 'username', 'email']
          }).then(function(data) {
            return res.status(200)
              .json({
                status: 'success',
                data: {
                  id: data.id,
                  username: data.username,
                  email: data.email
                },
                message: 'You have successfully registered'
              });
          }).catch(Sequelize.ValidationError, function (err) {
            // respond with validation errors
            return res.status(422)
              .json({
                status: 'exception',
                data: err.errors,
                message: 'Validation failed'
              });
          }).catch(function (err) {
            return next(err);
          });
        }).catch(function(err) {
          return next(err);
        });
      });
    }
  });
}


function login(req, res, next) {
  // validate input
  req.checkBody('password', 'password is required').notEmpty();
  req.checkBody('loginId', 'LoginId is required').notEmpty();

  req.getValidationResult().then(function(result) {

    if (!result.isEmpty()) {
      // return error if there is validation error
      return res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'Validation Failed'
        });
    } else {
      // find user with provided login id
      db.user.findOne({
        where: {
          $or: [
            {email: req.body.loginId},
            {username: req.body.loginId},
          ],
        }
      }).then(function(user) {
        // if user found
        if (user) {
          db.user_role.findOne({
            where: {
              id: user.user_roleId
            },
            attributes: ['role']
          }).then(function(roleData) {
            var role = roleData.role;
            var userId = user.id;
            var username = user.username;
            // compare password
            bcrypt.compare(req.body.password, user.password, function(err, response) {
              if (err) {
                return res.status(401)
                  .json({
                    status: 'exception',
                    message: 'Authentication failed. Wrong password.'
                  });
              } else if (response) {
                    // create authentication token
                    var token = jwt.encode(req.body.loginId, 'hash', 'HS256');

                    db.devicetoken.findOne({
                      where: {
                        userId: userId
                      },
                      attributes: ['id', 'userId', 'token']
                    }).then(function(deviceToken) {

                      if (deviceToken) {
                        db.devicetoken.update({
                          token: token,
                          added_at: moment().format('YYYY-MM-DD HH:mm:ss Z'),
                        }, {
                          where: {
                            userId: userId
                          },
                          returning: true
                        }).then(function(data) {
                          return res.status(200)
                            .json({
                              status: 'success',
                              data: {
                                id: userId,
                                role: role,
                                username: username,
                                token: token
                              },
                              message: 'User successfully login'
                            });
                        }).catch(function(err) {
                          return next(err);
                        });
                      } else {
                        db.devicetoken.create({
                          token: token,
                          added_at: moment().format('YYYY-MM-DD HH:mm:ss Z'),
                          userId: userId
                        }, {
                          fields: ['token', 'added_at', 'userId']
                        }).then(function(data) {
                          return res.status(200)
                            .json({
                              status: 'success',
                              data: {
                                id: userId,
                                role: role,
                                username: username,
                                token: token
                              },
                              message: 'User successfully login'
                            });
                        }).catch(function(err) {
                          return next(err);
                        });
                      }
                    }).catch(function(err) {
                      return next(err);
                    });
                }
             else {
                return res.status(401)
                  .json({
                    status: 'exception',
                    message: 'Authentication failed. Wrong password.'
                  });
              }
            });
          }).catch(function(err) {
            return next(err);
          });
        } else {
          return res.status(401)
            .json({
              status: 'exception',
              message: 'Authentication failed. User not found.'
            });
        }
      }).catch(function(err) {
        return next(err);
      });
    }
  });
}

function forgotPassword(req, res, next) {
  req.checkBody({
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      },
      errorMessage: 'Email is required'
    }
  });

  req.getValidationResult().then(function(result) {

    if (!result.isEmpty()) {
      // return error if there is validation error
      return res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'Validation Failed'
        });
    } else {
      var resetCode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
      db.user.findOne({
        where: {
          email: req.body.email
        }
      }).then(function(user) {
        if (user) {
          db.user.update({
            remember_token: resetCode
          }, {
            where: {
              email: req.body.email
            },
            returning: true
          }).then(function(status) {
            if (status) {
              ejs.renderFile(__dirname + '/../views/forgot-password-mail.ejs', {email: req.body.email, resetCode: resetCode}, function(err, str) {
                // setup email data with unicode symbols
                let mailOptions = {
                  from: '"Axovel" <axovel@axovel.com>', // sender address
                  to: req.body.email, // list of receivers
                  subject: 'Reset Password: Axovel', // Subject line
                  html: str
                };

                // send mail with defined transport object
                transport.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    return console.log(error);
                  }
                });
              });
              return res.status(200)
                .json({
                  status: 'success',
                  message: 'We have sent you an email with reset password link. Kindly check.'
                });
            } else {
              return next(err);
            }
          }).catch(function(err) {
            return next(err);
          });
        } else {
          return res.status(404)
            .json({
              status: 'exception',
              message: 'User not found'
            });
        }
      }).catch(function(err) {
        return next(err);
      });
    }
  });
}

function resetPassword(req, res, next) {
  // validate input
  req.checkBody({
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      },
      errorMessage: 'Email is required'
    },
    'password': {notEmpty: true, errorMessage: 'Password is required'},
    'reset_code': {notEmpty: true, errorMessage: 'Reset Code is required'}
  });

  req.getValidationResult().then(function(result) {

    if (!result.isEmpty()) {
      // return error if there is validation error
      return res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'Validation Failed'
        });
    } else {
      db.user.findOne({
        where: {
          email: req.body.email
        }
      }).then(function(user) {
        if (user) {
          if (user.remember_token != req.body.reset_code) {
            return res.status (422)
              .json({
                status: 'exception',
                message: 'Wrong reset code'
              });
          } else {
            bcrypt.hash(req.body.password, null, null, function(err, hash) {
              // if error occurs
              if (err) return next(err);

              db.user.update({
                password: hash,
                remember_token: null
              }, {
                where: {
                  id: user.id
                }
              }).then(function(status) {
                if (status) {
                  return res.status(200)
                    .json({
                      status: 'success',
                      message: 'Password Changed successfully'
                    });
                } else {
                  return res.status(422)
                    .json({
                      status: 'exception',
                      message: 'Server Error'
                    });
                }
              }).catch(function(err) {
                return next(err);
              });
            });
          }
        } else {
          return res.status(404)
            .json({
              status: 'exception',
              message: 'User not found'
            });
        }
      }).catch(function(err) {
        return next(err);
      });
    }
  });
}
