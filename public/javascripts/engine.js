////////////////////////////////////////FIELD SET UP//////////////////////////////////////

//Pre-define certain values
var FIELD_SIZE = 800;
var MAX_TILES = 10;
var TILE_HEIGHT = FIELD_SIZE/MAX_TILES;
var TILE_WIDTH = FIELD_SIZE/MAX_TILES;

//current workarounds
var tiles;
var minion;
var pieces = {
  1: new Minion()
};

//Playing field
function Field(size){

  //Even for non-uniform fields, there will still be a rightmost/topmost tile
  this.length = size;
  this.width = size;
  
  //2D array of all tiles in the field
  this.tiles = [];

}

//Single "square" of the field
function Tile(x,y){

  //"id" of tile
  this.xid = x;
  this.yid = y;

  //Position visually (for selecting tiles mostly)
  this.x = x*TILE_WIDTH;
  this.y = y*TILE_HEIGHT;

  //Implement height later
  this.height = 0;

  //Is this tile accessible?
  this.access = true;

  //Who is occupying this tile?
  this.occupant = 0;

}

//Initialize a playing area
function createField(size){


  var field = new Field(size);
  
  //Generate all other tiles
  for(var i = 0; i<size; i++){
    field.tiles[i] = new Array(size);
    for(var j =0; j<size; j++){
      field.tiles[i][j] = new Tile(i,j);
    }
  }

  return field;

}



/////////////////////////////////////////CANVAS SET UP///////////////////////////////////////

//Create the Canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var wrapper = document.getElementById("wrapper");
canvas.width = FIELD_SIZE;
canvas.height = FIELD_SIZE;
wrapper.appendChild(canvas);

//Image rendering
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function(){ bgReady = true; };
bgImage.src = "images/bg1.png";
var pReady = false;
var pImage = new Image();
pImage.onload = function(){ pReady = true; };
pImage.src = "images/player.png";

//Draw the grid
function initCanvas(){
  var field = createField(10);
  tiles = field.tiles;
  for(var i in tiles){
    for(var j in tiles[i]){
      fillTile(i,j,"#FFFFFF")
    }
  }
  tiles[0][0].occupant = 1;
  pieces[1].xTile = 0;
  pieces[1].yTile = 0;
  fillTile(0,0,"#000000")
}

function render(){


}

///////////////////////////////////////CLICK EVENTS//////////////////////////////////////////

canvas.addEventListener("click", handleClick, false);
//Is something being moved right now?

//Handle a click event
function handleClick(e){
  e.preventDefault();
  if(handleClick.midMove == undefined){
    handleClick.midMove = false;
    handleClick.tile = {};
    handleClick.tile.x = -1;
    handleClick.tile.y = -1;
  }
  //X and Y of the click
  var xPosition = e.pageX - canvas.offsetLeft;
  var yPosition = e.pageY - canvas.offsetTop;

  //Which tile did I select?
  var xTile = Math.floor(MAX_TILES*xPosition/FIELD_SIZE);
  var yTile = Math.floor(MAX_TILES*yPosition/FIELD_SIZE);

  //If this is the first click i.e. nothing has been selected
  if(!handleClick.midMove){

    //Select it! Set all static variables to know that a piece is currently selected 
    if(tiles[xTile][yTile].occupant){
      handleClick.midMove = true;
      handleClick.tile.x = xTile;
      handleClick.tile.y = yTile;
      handleClick.piece = pieces[tiles[xTile][yTile].occupant]
      selectPiece(xTile, yTile);

    }
  }
  //If something has been selected
  else{ 
    //Make sure its being moved within its range
    if(validMove(xTile,yTile,handleClick.piece.selectPattern(false))){
      movePiece(handleClick.tile.x,handleClick.tile.y,xTile,yTile);
      //Nothing is selected anymore
      handleClick.midMove = false;
      handleClick.tile.x = -1;
      handleClick.tile.y = -1;
      handleClick.piece = null;
    }
    //Else you clicked outside the valid range
    else{

      //Do something?

    }
  }

}


//Fill a specified tile a specified color
function fillTile(x,y,color){

  ctx.fillStyle=color;
  ctx.fillRect(tiles[x][y].x,tiles[x][y].y,TILE_WIDTH,TILE_HEIGHT);
  ctx.strokeRect(tiles[x][y].x,tiles[x][y].y,TILE_WIDTH,TILE_HEIGHT);
   
}

//Select a piece
function selectPiece(x,y){
  var selected = pieces[tiles[x][y].occupant]; //selected is now the minion on selected tile
  fillTile(x,y,"#666666");
  selected.highlightPattern(false);
  
}

//Move a piece from x1,y1 to x2,y2
function movePiece(x1,y1,x2,y2){
  var temp = tiles[x1][y1].occupant; //temp holds the number of the selected piece
  //Clear the highlighting from the piece being selected for motion
  pieces[temp].clearPattern(false);

  //Clear previously occupied tile
  fillTile(x1,y1,"#FFFFFF")
  //Fill in now occupied tile
  fillTile(x2,y2,"#000000");
  //Update the Minion with its new location
  pieces[temp].xTile = x2;
  pieces[temp].yTile = y2;
  //Update the tiles with their new occupants
  tiles[x1][y1].occupant = 0;
  tiles[x2][y2].occupant = temp;
}

//Check if [x,y] is in validTiles
function validMove(x,y,validTiles){
  for(var index in validTiles){
    if(validTiles[index][0] == x && validTiles[index][1] == y)
      return true;
  }
  return false;
}