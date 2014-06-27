var opponentsVisible;
var moveIsAttack;
var placeMinions;
var pieceSet;
var fieldWidth;
var fieldLength;

//Pass the name of a game to setOptions to set up for that game
//Else, pass false for the first argument and pass a custom set of arguments

//oppVis determines if you can see what the pieces your opponent has are
//movIsAtk is making it so you attack by moving on top of a minion
//plMin determines if you can choose where each minion starts
//pcSet is the set of pieces each player should start with
//fWidth and fLength are self-explanatory, they are in units of tiles
function setOptions(presetGame, oppVis, movIsAtk, plMin, pcSet, fWidth, fLength){

	var set;
	//If they passed a preset game
	if(presetGame != false){
		set = gameHash[presetGame];
		//The set couldn't be found
		if(typeof set == "undefined")
			return false;

		opponentsVisible = set.opponentsVisible;
		moveIsAttack = set.moveIsAttack;
		placeMinions = set.placeMinions;
		pieceSet = set.pieces;
		fieldWidth = set.fieldWidth;
		fieldLength = set.fieldLength;

	}
	//Else parse the custom set of rules
	else{
		opponentsVisible = oppVis;
		moveIsAttack = movIsAtk;
		placeMinions = plMin;
		pieceSet = pcSet;
		fieldWidth = fWidth;
		fieldLength = fLength;
	}

}

var strategoSet = {
	"opponentsVisible": false,
	"moveIsAttack": true,
	"placeMinions": true,
	"pieces": {
		0: {}
	}
};

var chessSet = {
	"opponentsVisible": true,
	"moveIsAttack": true,
	"placeMinions": false,
	"pieces": {
		0: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 0, startingY: 6}, //pawn
		1: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 1, startingY: 6}, //pawn
		2: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 2, startingY: 6}, //pawn
		3: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 3, startingY: 6}, //pawn
		4: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 4, startingY: 6}, //pawn
		5: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 5, startingY: 6}, //pawn
		6: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 6, startingY: 6}, //pawn
		7: {motionPattern: "chessPawn", motionRange: 1, image: "images/chess/pawn", startingX: 7, startingY: 6}, //pawn
		8: {motionPattern: "+", motionRange: 8, image: "images/chess/rook", startingX: 0, startingY: 7}, //rook
		9: {motionPattern: "+", motionRange: 8, image: "images/chess/rook", startingX: 7, startingY: 7}, //rook
		10: {motionPattern: "chessKnight", motionRange: 1, image: "images/chess/knight", startingX: 1, startingY: 7}, //knight
		11: {motionPattern: "chessKnight", motionRange: 1, image: "images/chess/knight", startingX: 6, startingY: 7}, //knight
		12: {motionPattern: "x", motionRange: 8, image: "images/chess/bishop", startingX: 2, startingY: 7}, //bishop
		13: {motionPattern: "x", motionRange: 8, image: "images/chess/bishop", startingX: 5, startingY: 7}, //bishop
		14: {motionPattern: "square", motionRange: 1, image: "images/chess/king", startingX: 4, startingY: 7}, //king
		15: {motionPattern: "chessQueen", motionRange: 8, image: "images/chess/queen", startingX: 3, startingY: 7} //queen
	},
	"fieldWidth": 8,
	"fieldLength": 8
};

var minionsSet = {
	"opponentsVisible": true,
	"moveIsAttack": false,
	"placeMinions": true
};

var gameHash = {
	"stratego": strategoSet,
	"chess": chessSet,
	"minions": minionsSet
};