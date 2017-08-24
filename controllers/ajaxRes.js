var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var moment = require('moment');
var bcrypt = require('bcrypt-nodejs');
var db = require('../models');

module.exports = {
  checkUsername: checkUsername,
  checkEmail: checkEmail
}

function checkUsername(req, res, next) {
  req.checkBody({
    'username': {
      notEmpty: true,
      errorMessage: 'Username is required'
    }
  });
  req.getValidationResult().then(function(result) {
    if(!result.isEmpty()) {
      res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'validation failed'
        });
    }
    else {
      db.user.findOne({
        where: {
          username: req.body.username
        }
      }).then(function(user) {
        if(user) {
          res.status(422)
            .json({
              status: 'exception',
              message: 'Username already exist'
            });
        }
        else {
          res.status(200)
            .json({
              status: 'success',
              message: 'Ok'
            });
        }
      }).catch(function(err) {
        return next(err);
      });
    }
  });
}

function checkEmail(req, res, next) {
  req.checkBody({
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Email is not valid'
      },
      errorMessage: 'Email is required'
    }
  });
  req.getValidationResult().then(function(result) {
    if(!result.isEmpty()) {
      res.status(422)
        .json({
          status: 'exception',
          data: result.array(),
          message: 'validation failed'
        });
    }
    else {
      db.user.findOne({
        where: {
          email: req.body.email
        }
      }).then(function(user) {
        if(user) {
          res.status(422)
            .json({
              status: 'exception',
              message: 'Email already exist'
            });
        }
        else {
          res.status(200)
            .json({
              status: 'success',
              message: 'Ok'
            });
        }
      }).catch(function(err) {
        return next(err);
      });
    }
  });
}
