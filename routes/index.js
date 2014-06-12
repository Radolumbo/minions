var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Minions' });
});

/* GET game page. */
router.get('/game', function(req, res){
  res.render('game', {title: 'Game' });
});

module.exports = router;
