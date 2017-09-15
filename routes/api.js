var express	= require('express');
var router 	= express.Router();
var port 	= process.env.PORT || 5000;

var hr = require('../controllers/hrAction');
var auth = require('../controllers/authenticate');
var ajax = require('../controllers/ajaxRes');


router.get('/', function(req, res, next) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

router.post('/addEmpDetail', hr.addEmpDetail);
router.post('/editEmpDetail', hr.editEmpDetail);
router.post('/getEmpDetail', hr.getEmpDetail);
router.post('/listEmp', hr.listEmp);
router.post('/deleteEmp', hr.deleteEmp);
router.post('/createCsv', hr.createCsv);
router.post('/addDevice', hr.addDevice);
// router.post('/createPdf', hr.createPdf);
router.post('/register', auth.signUp);
router.post('/login', auth.login);
router.post('/forgotPassword', auth.forgotPassword);
router.post('/resetPassword', auth.resetPassword);
router.post('/changePassword', auth.changePassword);
router.post('/checkUsername', ajax.checkUsername);
router.post('/checkEmail', ajax.checkEmail);

module.exports = router;
