var express	= require('express');
var router 	= express.Router();
var port 	= process.env.PORT || 5000;

var hr = require('../controllers/hrAction');
var auth = require('../controllers/authenticate');


router.get('/', function(req, res, next) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

router.post('/addEmpDetail', hr.addEmpDetail);
router.post('/editEmpDetail', hr.editEmpDetail);
router.post('/getEmpDetail', hr.getEmpDetail);
router.post('/listEmp', hr.listEmp);
router.post('/register', auth.signUp);
router.post('/login', auth.login);

module.exports = router;
