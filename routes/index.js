var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Minions' });
});


router.get('/game', function(req, res) {
  res.render('game', { title: 'Minions' });
});


module.exports = router;
