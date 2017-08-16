var express = require('express');
var router = express.Router();

var connection = require('../config/dbconnection');


module.exports = {
  addEmpDetail: addEmpDetail,
  addEmpDoc: addEmpDoc,
  addEmpDevice: addEmpDevice,
  addPrevEmplrDetail: addPrevEmplrDetail,
  getEmpDetail: getEmpDetail
}


function addEmpDetail(req, res, next) {

}

function addEmpDoc() {

}

function addEmpDevice() {

}

function addPrevEmplrDetail() {

}

function getEmpDetail(req, res, next) {
  var qry = "SELECT * FROM employee WHERE ?";
  var one = 1;
  connection.query(qry, one, function(err, result) {
    if(err) {
      return res.status(404)
        .json({
          status: "exception",
          message: "database error"
        });
    }

    else {
      if(result) {
        return res.status(200)
          .json({
            status: 'success',
            data: result,
            message: 'Employee details found successfully'
          });
      }
      else {
        return res.status(404)
          .json({
            status: 'exception',
            message: 'Employee details not found'
          })
      }
    }
  });
}
