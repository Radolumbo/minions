var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Radolumbo Dot Com' });
});


router.get('/game', function(req, res) {
  res.render('game', { title: 'Minions' });
});


module.exports = router;
