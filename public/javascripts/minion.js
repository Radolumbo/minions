function Minion(image, job){

	//image source
	this.image = new Image();
	this.image.src = image;
	this.image.ready = false;
	this.image.onload =  function(){ this.ready = true }; //For rendering purposes


	//Moving pattern
	this.motionPattern = "radial";
	this.motionRange = 1;

	//Attack pattern
	this.attackPattern = "teleport";
	this.attackRange = 1;
	this.attack = 1;

	//job
	this.job = job;

	//HP
	this.HP = 1;
	//cost
	//special effects

	//Current tile
	this.xTile = -1;
	this.yTile = -1;

	//Is this minion currently being selected?
	this.selected = false;

	//functions
	this.highlightPattern = highlightPattern;
	this.selectPattern = selectPattern;
	this.clearPattern = clearPattern;

	//dead
	this.alive = true;

	//Is this my minion?
	this.mine = true;
}

//Highlight the spaces the piece can move or attack based on bool isAttack
function highlightPattern(isAttack){
	//Select tiles
	var validTiles = this.selectPattern(isAttack);
	//Color them appropriately
	for(var i in validTiles){
		//Skip any invalid tiles i.e. tiles "off the grid" and skip the tile that the piece is on
		if(!onBoard(validTiles[i][0],validTiles[i][1]))
			continue;
		else if(validTiles[i][0] == this.xTile && validTiles[i][1] == this.yTile)
			continue;
		//If the tile you are highlighting is occupied, gotta highlight the tile and then redraw its image -- only can move onto a unit if moveIsAttack or if you're attacking
		//Can't attack your own minions
		else if(tiles[validTiles[i][0]][validTiles[i][1]].occupant > -1 && ((isAttack || moveIsAttack) && !pieces[tiles[validTiles[i][0]][validTiles[i][1]].occupant].mine )){
			fillTile(validTiles[i][0],validTiles[i][1], isAttack ? "#FF0F3B" : "#B3F0FF");
			drawTile(validTiles[i][0],validTiles[i][1],pieces[tiles[validTiles[i][0]][validTiles[i][1]].occupant].image);
			continue;
		}
		//Otherwise, there's a minion there and you CAN'T MOVE THERE
		else if(tiles[validTiles[i][0]][validTiles[i][1]].occupant > -1)
			continue;
		//Color based on whether isAttack
		fillTile(validTiles[i][0],validTiles[i][1], isAttack ? "#FF0F3B" : "#B3F0FF");
	}
}

//Same as highlightPattern, except reverting things to their original color
function clearPattern(isAttack){
	//Select tiles
	var validTiles = this.selectPattern(isAttack);
	//Color them appropriately
	for(var i in validTiles){
		//Skip any invalid tiles i.e. tiles "off the grid" and skip the tile that the piece is on and skip occupied tiles
		if(!onBoard(validTiles[i][0],validTiles[i][1]))
			continue;
		//Don't highlight the space the guy is currently on
		else if(validTiles[i][0] == this.xTile && validTiles[i][1] == this.yTile)
			continue;
		else if(tiles[validTiles[i][0]][validTiles[i][1]].occupant > -1 && ((isAttack || moveIsAttack) && !pieces[tiles[validTiles[i][0]][validTiles[i][1]].occupant].mine )){
			fillTile(validTiles[i][0],validTiles[i][1], "#FFFFFF");
			drawTile(validTiles[i][0],validTiles[i][1],pieces[tiles[validTiles[i][0]][validTiles[i][1]].occupant].image);
			continue;
		}
		//Otherwise, there's a minion there and you CAN'T MOVE THERE
		else if(tiles[validTiles[i][0]][validTiles[i][1]].occupant > -1)
			continue;
		//Color base
		fillTile(validTiles[i][0],validTiles[i][1],"#FFFFFF");
	}
}



//Given a minion, find the attack or motion pattern
function selectPattern(isAttack){
	var validTiles = [];
	//Extract necessary data from the minion
	var pattern = isAttack ? this.attackPattern : this.motionPattern;
	var range = isAttack ? this.attackRange : this.motionRange;
	var xTile = this.xTile;
	var yTile = this.yTile;

	switch(pattern) {
		//Algorithm for finding all tiles to move within radius
		case "radial":
			//Do a range-limited BFS to determine valid movement--allows for other minions to "block" movement
			var queue = [];
			var validTiles = [];
			var visited = [];
			for(var k = 0; k < MAX_TILES; k++){
				visited[k] = new Array(MAX_TILES);
			}
			//Queue that contains the currently unvisited nodes to be explored
			queue.push({'x': xTile, 'y': yTile, 'range': range});
			while(queue.length > 0){
				var tile = queue.shift();
				if(tile.range <= 0) continue; //You cannot add any of these neighbors, we are at the end of the range
				var x = tile.x;
				var y = tile.y;
				//Check each adjacent tile to see if it is within range and not occupied
				if(x+1 < MAX_TILES && !visited[x+1][y] && !(tiles[x+1][y].occupant > -1)){
					validTiles.push([x+1,y]);
					visited[x+1][y] = true;
					queue.push({'x': x+1, 'y': y, 'range': tile.range-1});
				}
				if(x > 0 && !visited[x-1][y] && !(tiles[x-1][y].occupant > -1)){
					validTiles.push([x-1,y]);
					visited[x-1][y] = true;
					queue.push({'x': x-1, 'y': y, 'range': tile.range-1});
				}
				if(y+1 < MAX_TILES && !visited[x][y+1] && !(tiles[x][y+1].occupant > -1)){
					validTiles.push([x,y+1]);
					visited[x][y+1] = true;
					queue.push({'x': x, 'y': y+1, 'range': tile.range-1});
				}
				if(y > 0 && !visited[x][y-1] && !(tiles[x][y-1].occupant > -1)){
					validTiles.push([x,y-1]);
					visited[x][y-1] = true;
					queue.push({'x': x, 'y': y-1, 'range': tile.range-1});
				}
			}
			break;
		//Same as radial, except not impeded by other units--completely different algorithm though,
		//simply extends out from the unit instead of needing a graph traversal
    case "teleport":
      for(var i = 0; i<=range; i++){
      	for(var j = 0; j<=range-i; j++){
      		validTiles.push([xTile+i,yTile+j]);
      		validTiles.push([xTile+i,yTile-j]);
      		validTiles.push([xTile-i,yTile+j]);
      		validTiles.push([xTile-i,yTile-j]);
      	}

      }
      break;
    //Do a loop for each diaganol, this makes it easy to stop if you hit a piece
    case "x":
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
      break;
     //Do a loop for each line
   	case "+":
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
   		break;
   	//Like a king in chess, basically
 		case "square":
 			for(var i = -1*range; i<=range; i++){
 				for(var j = -1*range; j<=range; j++){
 					validTiles.push([xTile+i,yTile+j]);
 				}
 			}
 			break;
   	//Like a pawn in chess, can only move forward and gets a bonus if on the starting spot
   	//Can move diaganol to attack if moveIsAttack is on
   	case "chessPawn":
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
   		break;
   	//Like a knight in chess.
   	case "chessKnight":
   		for(var i = -2; i <= 2; i++){
   			if(i==0) continue; //skip 0
   			var j = 3 - Math.abs(i); // 2 for 1 and 1 for 2
   			validTiles.push([xTile+i,yTile+j]);
   			validTiles.push([xTile+i,yTile-j]);
   		}
   		break;
   		//Simple solution: just combine x and + from above
   	case "chessQueen":
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
   		break;
    default:
        //
	}
	return validTiles;

}

//Convert the minions to something that can be sent over a socket
function extractMinions(minions){
	var simpleMinions = [];
	for(var x in minions){
		simpleMinions.push({"image": minions[x].image.src, "xTile": minions[x].xTile, "yTile": minions[x].yTile});
	}
	return simpleMinions;
}

//Is this x,y pair on the board?
function onBoard(x,y){
	if(x<0 || y<0 || x>=MAX_TILES || y>=MAX_TILES)
		return false;
	return true;
}