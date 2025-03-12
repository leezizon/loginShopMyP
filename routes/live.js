var express = require('express');

//app에서가져온 router
var router = express.Router();

const bodyParser = require('body-parser');
//json 사용,설정
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/leeG', function(req, res, next) {
    res.render('game.html');
});

router.post('/selectManageGrid', function(req, res) {
  var jsonsteer = {val:'기존'};
  if(req.user && req.user.id == 5){
    var jsonsteer = {val:'사람있음'};
  }
  res.json(jsonsteer);    
});


module.exports = router;