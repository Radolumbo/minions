var express = require('express');
var router = express.Router();

var mongoUri = process.env.MONGOHQ_URL ||
								"localhost:27017/minions";

//Connect to mongo
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoUri);


/* GET matches page. */
router.get('/', function(req, res) {
	var matches = db.get('matches');
	matches.find({},function(err,docs){
		res.render('matches', { 
			title: 'Matches',
			matches: docs 
		});
	});
});

/*GET new match page */
router.get('/new', function(req, res){
	res.render('newmatch',{ title: "Create Match"});
});

/*Post a matches page, this creates a new match*/
router.post('/', function(req, res){
	var matches = db.get('matches');
	var matchName = req.body.matchName;
	matches.insert({
		"matchName": matchName
	}, function(err, doc){
		if(err){
			//Return error
			console.log(err);
			res.send("Something went wrong. Woops. Tell me: shmozer@gmail.com");
		}
		else{
			res.location("matches/" + doc._id);
			res.redirect("matches/" + doc._id);
		}
	})
});

/* GET a specific match. */
router.get('/:id', function(req, res) {
  res.render('match', { title: req.params.id });
});

module.exports = router;
