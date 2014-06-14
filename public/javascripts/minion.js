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
	"mage": "radial",
	"warrior": "radial"
};
//Attack ranges
var jobAR = {
	"mage": 3,
	"warrior": 1
};


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

	//job
	this.job = job;

	//HP
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