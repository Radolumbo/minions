var opponentsVisible;
var moveIsAttack;
var placeMinions;
var pieceSet;
var fieldWidth;
var fieldLength;
var specialRules;

//Pass the name of a game to setOptions to set up for that game
//Else, pass false for the first argument and pass a custom set of arguments

//oppVis determines if you can see what the pieces your opponent has are
//movIsAtk is making it so you attack by moving on top of a minion
//plMin determines if you can choose where each minion starts
//pcSet is the set of pieces each player should start with
//fWidth and fLength are self-explanatory, they are in units of tiles
function setOptions(presetGame, oppVis, movIsAtk, plMin, pcSet, fWidth, fLength, spRules){

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
		specialRules = set.specialRules;

	}
	//Else parse the custom set of rules
	else{
		opponentsVisible = oppVis;
		moveIsAttack = movIsAtk;
		placeMinions = plMin;
		pieceSet = pcSet;
		fieldWidth = fWidth;
		fieldLength = fLength;
		specialRules = spRules;
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

////////////////////////////////////////////////////////////////////////////CHESS PIECES//////////////////////////////////////////////////////////////////////////////////////////

var chessSet = {
	"opponentsVisible": true,
	"moveIsAttack": true,
	"placeMinions": false,
	"pieces": {
		0: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 0, startingY: 6}, //pawn
		1: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 1, startingY: 6}, //pawn
		2: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 2, startingY: 6}, //pawn
		3: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 3, startingY: 6}, //pawn
		4: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 4, startingY: 6}, //pawn
		5: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 5, startingY: 6}, //pawn
		6: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 6, startingY: 6}, //pawn
		7: {motion: pawnMoveFunction, job: "pawn", image: "images/chess/pawn", startingX: 7, startingY: 6}, //pawn
		8: {motion: rookMoveFunction, job: "rook", image: "images/chess/rook", startingX: 0, startingY: 7}, //rook
		9: {motion: rookMoveFunction, job: "rook", image: "images/chess/rook", startingX: 7, startingY: 7}, //rook
		10: {motion: knightMoveFunction, job: "knight", image: "images/chess/knight", startingX: 1, startingY: 7}, //knight
		11: {motion: knightMoveFunction, job: "knight", image: "images/chess/knight", startingX: 6, startingY: 7}, //knight
		12: {motion: bishopMoveFunction, job: "bishop", image: "images/chess/bishop", startingX: 2, startingY: 7}, //bishop
		13: {motion: bishopMoveFunction, job: "bishop", image: "images/chess/bishop", startingX: 5, startingY: 7}, //bishop
		14: {motion: kingMoveFunction, job: "king", image: "images/chess/king", startingX: 4, startingY: 7}, //king
		15: {motion: queenMoveFunction, job: "queen", image: "images/chess/queen", startingX: 3, startingY: 7} //queen
	},
	"fieldWidth": 8,
	"fieldLength": 8,
	"specialRules": [pawnPromotionRule, kingPositionRule]
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

//Rule for promoting pawns
function pawnPromotionRule(){
	//Check each back tile to see what's up
	for(var x in tiles){
		if(tiles[x][0].occupant > -1 && pieces[tiles[x][0].occupant].mine && pieces[tiles[x][0].occupant].job == "pawn"){
			//Spawn modal for user to choose their new piece
			$("#modals").append(
				'<div class="modal fade" id="promotionModal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">\n'
        + '<div class="modal-dialog">\n'
          + '<div class="modal-content">\n'
            + '<div class="modal-body">\n'
              + 'Pawn promotion!\n'
              + '<button type="button" class="btn btn-default" onclick="promotePawn('+x+',0,\'queen\')">Queen</button>\n'
              + '<button type="button" class="btn btn-default" onclick="promotePawn('+x+',0,\'knight\')">Knight</button>\n'
              + '<button type="button" class="btn btn-default" onclick="promotePawn('+x+',0,\'rook\')">Rook</button>\n'
              + '<button type="button" class="btn btn-default" onclick="promotePawn('+x+',0,\'bishop\')">Bishop</button>\n'
            + '</div>\n'
          + '</div>\n'
        + '</div>\n'
      + '</div>');
      $("#promotionModal").modal("show");
		}
	}
}

//Supplement to above function
function promotePawn(x,y,job){
	pieces[tiles[x][0].occupant].job = job;
  pieces[tiles[x][0].occupant].image.src = "images/chess/" + job + playerNumber + ".png"; //bad workaround
  if(job=="queen"){
  	pieces[tiles[x][0].occupant].motion = queenMoveFunction;
  }
  else if(job=="knight"){
  	pieces[tiles[x][0].occupant].motion = knightMoveFunction;
  }
  else if(job=="rook"){
  	pieces[tiles[x][0].occupant].motion = rookMoveFunction;
  }
  else if(job=="bishop"){
  	pieces[tiles[x][0].occupant].motion = bishopMoveFunction;
  }

  socket.emit("piece change", {"x": x, "y": y, "image": pieces[tiles[x][0].occupant].image.src});

	$("#promotionModal").modal("hide");
}

//Rule for kings starting in different positions
function kingPositionRule(){

}

//See if the rooks or kings have moved yet
function castleRule(){

}

//Function for moving as a pawn
function pawnMoveFunction(){

	var validTiles = [];
	var xTile = this.xTile;
	var yTile = this.yTile;
	var range = 1;

	//increase range by 1 if the pawn is on his starting square
	if(yTile == pieceSet[tiles[xTile][yTile].occupant].startingY){
		range = range + 1;
	}
	for(var i = 1; i<=range; i++){
		//If there's a piece in the way, stop the loop
		if(!onBoard(xTile,yTile-i) || tiles[xTile][yTile-i].occupant > -1)
			break;
		validTiles.push([xTile,yTile-i]);
	}
	if(onBoard(xTile-1,yTile-1) && tiles[xTile-1][yTile-1].occupant > -1 && moveIsAttack){
		validTiles.push([xTile-1,yTile-1]);
	}
	if(onBoard(xTile+1,yTile-1) && tiles[xTile+1][yTile-1].occupant > -1 && moveIsAttack){
		validTiles.push([xTile+1,yTile-1]);
	}

	return validTiles;
}

function bishopMoveFunction(){

	var validTiles = [];
	var xTile = this.xTile;
	var yTile = this.yTile;
	var range = 8;

	for(var i = 1; i<=range; i++){
  	validTiles.push([xTile+i,yTile+i]);
		if(!onBoard(xTile+i,yTile+i) || tiles[xTile+i][yTile+i].occupant > -1) break; //stop the loop if you hit a unit or hit the end of the board, but add the square that unit was on
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile+i,yTile-i]);
  	if(!onBoard(xTile+i,yTile-i) || tiles[xTile+i][yTile-i].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile-i,yTile+i]);
  	if(!onBoard(xTile-i,yTile+i) || tiles[xTile-i][yTile+i].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile-i,yTile-i]);
  	if(!onBoard(xTile-i,yTile-i) || tiles[xTile-i][yTile-i].occupant > -1) break;
  }

  return validTiles;
}

function knightMoveFunction(){

	var validTiles = [];
	var xTile = this.xTile;
	var yTile = this.yTile;

	for(var i = -2; i <= 2; i++){
		if(i==0) continue; //skip 0
		var j = 3 - Math.abs(i); // 2 for 1 and 1 for 2
		validTiles.push([xTile+i,yTile+j]);
		validTiles.push([xTile+i,yTile-j]);
	}
  return validTiles;
}

function rookMoveFunction(){

	var validTiles = [];
	var xTile = this.xTile;
	var yTile = this.yTile;
	var range = 8;

	for(var i = 1; i<=range; i++){
  	validTiles.push([xTile+i,yTile]);
		if(!onBoard(xTile+i,yTile) || tiles[xTile+i][yTile].occupant > -1) break; //stop the loop if you hit a unit or hit the end of the board, but add the square that unit was on
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile-i,yTile]);
  	if(!onBoard(xTile-i,yTile) || tiles[xTile-i][yTile].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile,yTile+i]);
  	if(!onBoard(xTile,yTile+i) || tiles[xTile][yTile+i].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile,yTile-i]);
  	if(!onBoard(xTile,yTile-i) || tiles[xTile][yTile-i].occupant > -1) break;
	}		

  return validTiles;
}

function queenMoveFunction(){

	var validTiles = [];
	var xTile = this.xTile;
	var yTile = this.yTile;
	var range = 8;

	for(var i = 1; i<=range; i++){
  	validTiles.push([xTile+i,yTile+i]);
		if(!onBoard(xTile+i,yTile+i) || tiles[xTile+i][yTile+i].occupant > -1) break; //stop the loop if you hit a unit or hit the end of the board, but add the square that unit was on
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile+i,yTile-i]);
  	if(!onBoard(xTile+i,yTile-i) || tiles[xTile+i][yTile-i].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile-i,yTile+i]);
  	if(!onBoard(xTile-i,yTile+i) || tiles[xTile-i][yTile+i].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile-i,yTile-i]);
  	if(!onBoard(xTile-i,yTile-i) || tiles[xTile-i][yTile-i].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile+i,yTile]);
		if(!onBoard(xTile+i,yTile) || tiles[xTile+i][yTile].occupant > -1) break; //stop the loop if you hit a unit or hit the end of the board, but add the square that unit was on
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile-i,yTile]);
  	if(!onBoard(xTile-i,yTile) || tiles[xTile-i][yTile].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile,yTile+i]);
  	if(!onBoard(xTile,yTile+i) || tiles[xTile][yTile+i].occupant > -1) break;
  }
  for(var i = 1; i<=range; i++){
  	validTiles.push([xTile,yTile-i]);
  	if(!onBoard(xTile,yTile-i) || tiles[xTile][yTile-i].occupant > -1) break;
  }

  return validTiles;
}

function kingMoveFunction(){

	if(kingMoveFunction.hasMoved == undefined){
		kingMoveFunction.hasMoved = false;
	}

	var validTiles = [];
	var xTile = this.xTile;
	var yTile = this.yTile;
	var range = 1;

	for(var i = -1*range; i<=range; i++){
		for(var j = -1*range; j<=range; j++){
			validTiles.push([xTile+i,yTile+j]);
		}
	}

	//Castling!
  return validTiles;
}