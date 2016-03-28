var express = require('express');
var router = express.Router();
var authenticate = require('../handlers/');
var Files = require('../handlers/Files');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Google Drive File Uploader' });
});
router.get('/authenticate',authenticate.process);
router.get('/token',authenticate.token);

var dropbox =  require('../handlers/platforms/DropBox');
dropbox = new dropbox();

router.get('/dropbox',(req,res)=>{
  
  res.redirect(dropbox.authorize());
})
module.exports = router;
