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
//Function for moving as a pawn
var pawnMoveFunction = function(){

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

var bishopMoveFunction = function(){

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

var knightMoveFunction = function(){

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

var rookMoveFunction = function(){

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

var queenMoveFunction = function(){

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

var kingMoveFunction = function(){

	//This is to determine if you're allowed to castle;
	if(kingMoveFunction.hasMoved == undefined){
		kingMoveFunction.hasMoved = false;
		kingMoveFunction.leftRookMoved = false;
		kingMoveFunction.rightRookMoved = false;
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
	//Based on player number, make sure all the spaces between the rook and king are empty and not attacked
	//Only relevant if your own king, this prevents infinite loop from checking if a space is attacked by
	//opposing minions when looking for castles
	if(!kingMoveFunction.hasMoved && this.mine){
		if(!kingMoveFunction.leftRookMoved){
			if(playerNumber == 1){
				if(castleCheckIfCanCastle(1,7) && castleCheckIfCanCastle(2,7) && castleCheckIfCanCastle(3,7))
					validTiles.push([2,7]);
			}
			else{
				if(castleCheckIfCanCastle(1,7) && castleCheckIfCanCastle(2,7))
					validTiles.push([1,7]);
			}
		}
		if(!kingMoveFunction.rightRookMoved){
			if(playerNumber == 1){
				if(castleCheckIfCanCastle(5,7) && castleCheckIfCanCastle(6,7))
					validTiles.push([6,7]);
			}
			else{
				if(castleCheckIfCanCastle(4,7) && castleCheckIfCanCastle(5,7) && castleCheckIfCanCastle(6,7))
					validTiles.push([5,7]);
			}
		}
	}

  return validTiles;
}

var chessSet = {
	"opponentsVisible": true,
	"moveIsAttack": true,
	"placeMinions": false,
	"pieces": {
		0: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 0, startingY: 6}, //pawn
		1: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 1, startingY: 6}, //pawn
		2: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 2, startingY: 6}, //pawn
		3: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 3, startingY: 6}, //pawn
		4: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 4, startingY: 6}, //pawn
		5: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 5, startingY: 6}, //pawn
		6: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 6, startingY: 6}, //pawn
		7: {motion: pawnMoveFunction, job: "pawn", image: "/images/chess/pawn", startingX: 7, startingY: 6}, //pawn
		8: {motion: rookMoveFunction, job: "rook", image: "/images/chess/rook", startingX: 0, startingY: 7}, //rook
		9: {motion: rookMoveFunction, job: "rook", image: "/images/chess/rook", startingX: 7, startingY: 7}, //rook
		10: {motion: knightMoveFunction, job: "knight", image: "/images/chess/knight", startingX: 1, startingY: 7}, //knight
		11: {motion: knightMoveFunction, job: "knight", image: "/images/chess/knight", startingX: 6, startingY: 7}, //knight
		12: {motion: bishopMoveFunction, job: "bishop", image: "/images/chess/bishop", startingX: 2, startingY: 7}, //bishop
		13: {motion: bishopMoveFunction, job: "bishop", image: "/images/chess/bishop", startingX: 5, startingY: 7}, //bishop
		14: {motion: kingMoveFunction, job: "king", image: "/images/chess/king", startingX: 4, startingY: 7}, //king
		15: {motion: queenMoveFunction, job: "queen", image: "/images/chess/queen", startingX: 3, startingY: 7} //queen
	},
	"fieldWidth": 8,
	"fieldLength": 8,
	"specialRules": [pawnPromotionRule, kingPositionRule, castleRule, castleRookMove, checkRule]
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
  pieces[tiles[x][0].occupant].image.src = "/images/chess/" + job + playerNumber + ".png"; //bad workaround
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

  socket.emit("piece change", {"x": x, "y": y, "image": pieces[tiles[x][0].occupant].image.src, "motion": pieces[tiles[x][0].occupant].motion + ""});

	$("#promotionModal").modal("hide");
}

//Rule for kings starting in different positions
function kingPositionRule(){
	//have it run only once
	if(kingPositionRule.ran == undefined){
		kingPositionRule.ran = true;
		//Only do it as second player
		if(playerNumber == 2){
			//swamp the queen and king
			pieces[tiles[4][7].occupant].job = "queen";
			pieces[tiles[4][7].occupant].image.src = "/images/chess/queen2.png";
			pieces[tiles[4][7].occupant].motion = queenMoveFunction;
			pieces[tiles[3][7].occupant].job = "king";
			pieces[tiles[3][7].occupant].image.src = "/images/chess/king2.png";
			pieces[tiles[3][7].occupant].motion = kingMoveFunction;
			pieceSet[14].startingX = 3; //Need to record where the king started for castling
			//Because I automatically invert which 
  		socket.emit("piece change", {"x": 4, "y": 7, "image": pieces[tiles[4][7].occupant].image.src, "job": "queen", "motion": queenMoveFunction + ""});
  		socket.emit("piece change", {"x": 3, "y": 7, "image": pieces[tiles[3][7].occupant].image.src, "job": "king", "motion": kingMoveFunction + ""});
  	}
	}
}

//Basically, if any of the piece's starting points is empty for even a split second, 
//That means they moved
function castleRule(){
	//Have to split it up by player number b/c of different king starting positions--king of hacky, but
	if(playerNumber == 1){
		if(tiles[4][7].occupant == -1){
			kingMoveFunction.hasMoved = true;
		}
	}
	else{
		if(tiles[3][7].occupant == -1){
			kingMoveFunction.hasMoved = true;
		}
	}

	if(tiles[0][7].occupant == -1){
		kingMoveFunction.leftRookMoved = true;
	}

	if(tiles[7][7].occupant == -1){
		kingMoveFunction.rightRookMoved = true;
	}
}

//used by king move function to see if a castling is valid
//Called by king move function on each square between the rook and king to see if
//each square is both not occupied AND is not being attacked by an opposing piece
function castleCheckIfCanCastle(xTile,yTile){
	var allTheTiles = []; //will hold all the tiles the opponent can hit up baby
	var rMinions = remotePlayer.getMinions();

	var king = playerNumber == 1? pieces[14] : pieces[15]; //king number based on that playernumber

	for(var x in rMinions){
		if(rMinions[x].alive == false)
			continue;
		//Pawns are special because they only move "forward" so the motion function we have for them is
		//in the incorrect direction for the opponent
		if(rMinions[x].job == "pawn"){
			allTheTiles = allTheTiles.concat([[rMinions[x].xTile+1, rMinions[x].yTile+1], [rMinions[x].xTile-1, rMinions[x].yTile+1]]);
		}
		else{
			allTheTiles = allTheTiles.concat(rMinions[x].motion());
		}
	}

	//the square is occupied
	if(tiles[xTile][yTile].occupant > -1)
		return false;

	//the square is being attacked
	for(var index in allTheTiles){
      if(allTheTiles[index][0] == xTile && allTheTiles[index][1] == yTile)
        return false;
  }

  return true;
}

//Supplement to the castle rule that figures out when the king castles and moves the rook appropriately
//Basically checks to see if the king jumped 2 spaces or not, if it moves anywhere else, cant castle ever
function castleRookMove(){
	//See if you can stil lcastle
	if(castleRookMove.cantCastle == true){
		return;
	}

	//King starting position based on player number
	if(playerNumber == 1){
		//King is still just chillin
		if(tiles[4][7].occupant > -1 && pieces[tiles[4][7].occupant].job == "king")
			return;
		//King just castled left
		else if(tiles[2][7].occupant > -1 && pieces[tiles[2][7].occupant].job == "king"){
			//Move the rook
			movePiece(0, 7, 3, 7);
      socket.emit("move player", {"x1": 0, "y1": 7, "x2": 3, "y2": 7});
			castleRookMove.cantCastle = true;
		}
		//King just castled right
		else if(tiles[6][7].occupant > -1 && pieces[tiles[6][7].occupant].job == "king"){
			//Move the rook
			movePiece(7, 7, 5, 7);
      socket.emit("move player", {"x1": 7, "y1": 7, "x2": 5, "y2": 7});
			castleRookMove.cantCastle = true;
		}
		//King moved elsewhere, can't castle ever again
		else{
			castleRookMove.cantCastle = true;
		}
	}
	else{
		//King is still just chillin
		if(tiles[3][7].occupant > -1 && pieces[tiles[3][7].occupant].job == "king")
			return;
		//King castled left
		else if(tiles[1][7].occupant > -1 && pieces[tiles[1][7].occupant].job == "king"){
			//Move the rook
			movePiece(0, 7, 2, 7);
      socket.emit("move player", {"x1": 0, "y1": 7, "x2": 2, "y2": 7});
			castleRookMove.cantCastle = true;
		}
		//King castled right
		else if(tiles[5][7].occupant > -1 && pieces[tiles[5][7].occupant].job == "king"){
			//Move the rook
			movePiece(7, 7, 4, 7);
      socket.emit("move player", {"x1": 7, "y1": 7, "x2": 4, "y2": 7});
			castleRookMove.cantCastle = true;
		}
		//King moved elsewhere, can't castle ever again
		else{
			castleRookMove.cantCastle = true;
		}
	}
}

//Game over, bub
function checkmateRule(){
	console.log("see if in checkmate");
	var lMinions = localPlayer.getMinions();
	var allTheTiles = []; //will hold all the tiles the opponent can hit up baby
	var xTile;
	var yTile;
	var target; //keeps track of if a minion is killed by our testing each move
	var q = 0;
	for(var i in lMinions){
		if(lMinions[i].alive == false)
			continue
		//Pawns are special because they only move "forward" so the motion function we have for them is
		//in the incorrect direction for the opponent
		var tilesToCheck = lMinions[i].motion();
		for(var j in tilesToCheck){
			console.log(q++);
			xTile = lMinions[i].xTile;
			yTile = lMinions[i].yTile;
			if(onBoard(tilesToCheck[j][0],tilesToCheck[j][1]))
				target = tiles[tilesToCheck[j][0]][tilesToCheck[j][1]].occupant;
			else
				target = -1;
			if((target == -1 || !pieces[target].mine) && movePiece(xTile,yTile,tilesToCheck[j][0],tilesToCheck[j][1])){
				revertMove(xTile,yTile,tilesToCheck[j][0],tilesToCheck[j][1],target);
				return; //There is a valid move to get out of check
			}
		}
	}
	alert("Checkmate. You lose.");
}

//Because I'm too lazy to think of a better way, we test for checkmate by doing every single possible
//move and then reverting it
function revertMove(x1,y1,x2,y2,potentiallyKilledMinion){
	var mover = tiles[x2][y2].occupant; //mover holds the number of the selected piece

	//Make the move to check if it takes you out of check 
  pieces[mover].xTile = x1;
  pieces[mover].yTile = y1;
  //Update the tiles with their new occupants
  tiles[x1][y1].occupant = mover;
  tiles[x2][y2].occupant = potentiallyKilledMinion;
}

//Can't move through this shit
function checkRule(){
	if(checkRule.firstRun == undefined){
		checkRule.firstRun = false;
		//Override the move function so we can do a check for check
		movePiece = function(x1,y1,x2,y2){
			if(!onBoard(x2,y2))
				return false;

			var mover = tiles[x1][y1].occupant; //mover holds the number of the selected piece
			var target = tiles[x2][y2].occupant;

			//Make the move to check if it takes you out of check 
		  pieces[mover].xTile = x2;
		  pieces[mover].yTile = y2;
		  if(target > -1)
		  	pieces[target].alive = false;

		  //Update the tiles with their new occupants
		  tiles[x1][y1].occupant = -1;
		  tiles[x2][y2].occupant = mover;

		  //See if we're trying to move into check
		  if(checkIfCheck() && pieces[mover].mine){
		  	//Revert the move
			  pieces[mover].xTile = x1;
			  pieces[mover].yTile = y1;
			  tiles[x1][y1].occupant = mover;
			  tiles[x2][y2].occupant = target;
			  if(target > -1)
		  		pieces[target].alive = true;
			  return false;
		  }
		  else{
		  	return true;
		  }
		};
	}
	if(checkIfCheck()){
		if(checkRule.callCheckmate == false)
					checkmateRule();
		checkRule.callCheckmate = true;
	}
	else {
		checkRule.callCheckmate = false;
	}
}

function checkIfCheck(){
	var allTheTiles = []; //will hold all the tiles the opponent can hit up baby
	var rMinions = remotePlayer.getMinions();

	var king = playerNumber == 1? pieces[14] : pieces[15]; //king number based on that playernumber

	for(var x in rMinions){
		//skip dead minions
		if(rMinions[x].alive == false)
			continue;
		//Pawns are special because they only move "forward" so the motion function we have for them is
		//in the incorrect direction for the opponent
		if(rMinions[x].job == "pawn"){
			allTheTiles = allTheTiles.concat([[rMinions[x].xTile+1, rMinions[x].yTile+1], [rMinions[x].xTile-1, rMinions[x].yTile+1]]);
		}
		else{
			allTheTiles = allTheTiles.concat(rMinions[x].motion());
		}
	}

	//You're in check if this is the case
	for(var index in allTheTiles){
      if(allTheTiles[index][0] == king.xTile && allTheTiles[index][1] == king.yTile){
        return true;
      }
  }
}