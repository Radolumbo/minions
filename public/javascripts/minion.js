//Motion patterns
var jobMP = {
	"mage": "radial",
	"warrior": "radial"
};

//Motion ranges
var jobMR = {
	"mage": 1,
	"warrior": 3
};

//Attack patterns
var jobAP = {
	"mage": "teleport",
	"warrior": "teleport"
};
//Attack ranges
var jobAR = {
	"mage": 3,
	"warrior": 1
};
//HP
var jobHP = {
	"mage": 1,
	"warrior": 2
}

var jobATK = {
	"mage": 2,
	"warrior": 2
}


function Minion(job,image){

	//image source
	this.image = new Image();
	this.image.src = image;
	this.imageReady = false;

	//Moving pattern
	this.motionPattern = jobMP[job];
	this.motionRange = jobMR[job];

	//Attack pattern
	this.attackPattern = jobAP[job];
	this.attackRange = jobAR[job];
	this.attack = jobATK[job];

	//job
	this.job = job;

	//HP
	this.HP = jobHP[job];
	//cost
	//special affects

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
}

//Possible motion patterns
var patterns = {
	0: "radial",
	1: "teleport",
	2: "x",
	3: "+"
};

//Highlight the spaces the piece can move or attack based on bool isAttack
function highlightPattern(isAttack){
	//Select tiles
	var validTiles = this.selectPattern(isAttack);
	//Color them appropriately
	for(var i in validTiles){
		//Skip any invalid tiles i.e. tiles "off the grid" and skip the tile that the piece is on and skip occupied tiles
		if(validTiles[i][0]<0 || validTiles[i][1] < 0 || validTiles[i][0]>=MAX_TILES || validTiles[i][1]>=MAX_TILES)
			continue;
		else if(validTiles[i][0] == this.xTile && validTiles[i][1] == this.yTile)
			continue;
		else if(tiles[validTiles[i][0]][validTiles[i][1]].occupant)
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
		if(validTiles[i][0]<0 || validTiles[i][1] < 0 || validTiles[i][0]>=MAX_TILES || validTiles[i][1]>=MAX_TILES)
			continue;
		else if(validTiles[i][0] == this.xTile && validTiles[i][1] == this.yTile)
			continue;
		else if(tiles[validTiles[i][0]][validTiles[i][1]].occupant)
			continue;
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
				if(x+1 < MAX_TILES && !visited[x+1][y] && !tiles[x+1][y].occupant){
					validTiles.push([x+1,y]);
					visited[x+1][y] = true;
					queue.push({'x': x+1, 'y': y, 'range': tile.range-1});
				}
				if(x > 0 && !visited[x-1][y] && !tiles[x-1][y].occupant){
					validTiles.push([x-1,y]);
					visited[x-1][y] = true;
					queue.push({'x': x-1, 'y': y, 'range': tile.range-1});
				}
				if(y+1 < MAX_TILES && !visited[x][y+1] && !tiles[x][y+1].occupant){
					validTiles.push([x,y+1]);
					visited[x][y+1] = true;
					queue.push({'x': x, 'y': y+1, 'range': tile.range-1});
				}
				if(y > 0 && !visited[x][y-1] && !tiles[x][y-1].occupant){
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
    case "x":
      //
      break;
   	case "+":

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
		simpleMinions.push({"job": minions[x].job, "xTile": minions[x].xTile, "yTile": minions[x].yTile});
	}
	return simpleMinions;
}