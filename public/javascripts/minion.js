function Minion(){

	//Moving pattern
	this.motionPattern = "radial";
	this.motionRange = 3;

	//Attack pattern
	this.attackPattern = "radial";
	this.attackRange = 3;

	//HP
	//cost
	//special affects

	//Current tile
	this.xTile = -1;
	this.yTile = -1;

	//functions
	this.highlightPattern = highlightPattern;
	this.selectPattern = selectPattern;
	this.clearPattern = clearPattern;
}

//Possible motion patterns
var patterns = {
	0: "radial",
	1: "x",
	2: "+"
};

//Highlight the spaces the piece can move or attack based on bool isAttack
function highlightPattern(isAttack){
	//Select tiles
	var tiles = this.selectPattern(isAttack);
	//Color them appropriately
	for(var i in tiles){
		//Skip any invalid tiles i.e. tiles "off the grid"
		if(tiles[i][0]<0 || tiles[i][1] < 0 || tiles[i][0]>=MAX_TILES || tiles[i][1]>=MAX_TILES)
			continue;
		else if(tiles[i][0] == this.xTile && tiles[i][1] == this.yTile)
			continue;
		fillTile(tiles[i][0],tiles[i][1],"#B3F0FF");
	}
}

//Same as highlightPattern, except reverting things to their original color
function clearPattern(isAttack){
	//Select tiles
	var tiles = this.selectPattern(isAttack);
	//Color them appropriately
	for(var i in tiles){
		//Skip any invalid tiles i.e. tiles "off the grid" and skip the tile that the piece is on
		if(tiles[i][0]<0 || tiles[i][1] < 0 || tiles[i][0]>=MAX_TILES || tiles[i][1]>=MAX_TILES)
			continue;
		else if(tiles[i][0] == this.xTile && tiles[i][1] == this.yTile)
			continue;
		fillTile(tiles[i][0],tiles[i][1],"#FFFFFF");
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