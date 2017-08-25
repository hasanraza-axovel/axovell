var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var async = require('async');
var moment = require('moment');

var bcrypt = require('bcrypt-nodejs');

var jwt = require('jwt-simple');

var db = require('../models');
// var connection = require('../config/dbconnection');

module.exports = {
  signUp: signUp,
  login: login
}

// function signUp(req, res, next) {
//
//   // console.log(req.body);
// req.checkBody({
//     'email': {
//       notEmpty: true,
//       isEmail: {
//         errorMessage: 'Invalid Email'
//       },
//       errorMessage:'Email is required'
//     },
//     'username': {notEmpty: true, errorMessage: 'username is required'},
//     'password': {notEmpty: true, errorMessage: 'password is required'},
//     'user_role': {notEmpty: true, errorMessage: 'user_role_id is required'},
//   });
//
//   req.getValidationResult().then(function(result) {
//     if(!result.isEmpty()) {
//       return res.status(422)
//         .json({
//           status: 'exception',
//           data: result.array(),
//           message: 'Validation Failed'
//         });
//     }
//     else {
//       bcrypt.hash(req.body.password, null, null, function(err, hash) {
//         if(err) return next(err);
//
//         var qry = "SELECT id FROM user_role WHERE role=?";
//         var role = req.body.user_role;
//         var user_role_id;
//         connection.query(qry, role, function(err, result) {
//           if(err){
//             return res.status(404)
//               .json({
//                 status: "exception",
//                 message: "database select error"
//               });
//           }
//           else {
//             user_role_id = result[0].id;
//
//           }
//           var data = [
//             [req.body.email,
//             req.body.username,
//             hash,
//             user_role_id]
//           ];
//           console.log(data);
//           var insQry = "INSERT INTO user(email, username, password, user_role_id) VALUES ?";
//           connection.query(insQry, [data], function(error, resl) {
//             if(error) {
//               return res.status(404)
//                 .json({
//                   status: "exception",
//                   message: "database error"
//                 });
//             }
//             else {
//               console.log(resl);
//               return res.status(200)
//                 .json({
//                   status: 'success',
//                   data: {
//                     username: data[0][1]
//                   },
//                   message: 'You have successfully registered'
//                 });
//             }
//           });
//         });
//       });
//     }
//   });
// }
//
//
// function login(req, res, next) {
//   // console.log(req.body.loginId);
//   // req.chechBody('password','password is required').notEmpty();
//   // req.checkBody('loginId', 'loginId is required').notEmpty();
//   //
//   // req.getValidationResult().then(function(result) {
//   //
//   //   if(!result.isEmpty()) {
//   //
//   //     return res.status(422)
//   //       .json({
//   //         status: 'exception',
//   //         data: result.array(),
//   //         message: 'Validation Failed'
//   //       });
//   //   }
//   //   else {
//       var qry1 = "SELECT * FROM user WHERE email = ? OR usermame = ?";
//       connection.query(qry1, [req.body.loginId, req.body.loginId], function(err, user) {
//         if(err) {
//           return res.status(404)
//             .json({
//               status: "exception",
//               message: "database select user error"
//             });
//         }
//         else {
//           var user_role_id = user[0].user_role_id;
//           var qry2 = "SELECT role FROM user_role WHERE id = ?";
//           connection.query(qry2, user_role_id, function(err, role) {
//             if(err) {
//               return res.status(404)
//                 .json({
//                   status: "exception",
//                   message: "database select role error"
//               });
//             }
//           });
//           var Role = role[0];
//           var username = user[0].username;
//           var email = user[0].email;
//           var userId = user[0].userId;
//
//           bcrypt.compare(req.body.password, user[0].password, function(err, response) {
//             if(err) {
//               return res.status(401)
//                 .json({
//                   status: 'exception',
//                   message: 'Authentication failed. Wrong Password.',
//                 });
//             }
//             else {
//               return res.status(200)
//                 .json({
//                   status: 'success',
//                   data: {
//                     id: userId,
//                     role: Role,
//                     username: username,
//                     email: email
//                   },
//                   message: 'Login successfully'
//                 });
//             }
//           });
//         }
//       });
//     // }
//   // });
// }

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
                      }
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
