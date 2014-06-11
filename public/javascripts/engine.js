////////////////////////////////////////FIELD SET UP//////////////////////////////////////

//Pre-define certain values
var FIELD_SIZE = 800;
var MAX_TILES = 10;
var TILE_HEIGHT = FIELD_SIZE/MAX_TILES;
var TILE_WIDTH = FIELD_SIZE/MAX_TILES;

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
  var field = createField(8);
  console.log(field);
  tiles = field.tiles;
  for(var i in tiles){
    for(var j in tiles[i]){
      ctx.rect(tiles[i][j].x,tiles[i][j].y,TILE_WIDTH,TILE_HEIGHT);
      ctx.stroke();
    }
  }
  tiles[0][0].occupant = 1;
  ctx.fillRect(tiles[0][0].x,tiles[0][0].y,TILE_WIDTH,TILE_HEIGHT);
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
  var xPosition = e.clientX - canvas.offsetLeft;
  var yPosition = e.clientY - canvas.offsetTop;

  //Which tile did I select?
  var xTile = Math.floor(MAX_TILES*xPosition/FIELD_SIZE);
  var yTile = Math.floor(MAX_TILES*yPosition/FIELD_SIZE);

  //If this is the first click i.e. nothing has been selected
  if(!handleClick.midMove){

    //Highlight it!
    if(tiles[xTile][yTile].occupant){
      handleClick.midMove = true;
      handleClick.tile.x = xTile;
      handleClick.tile.y = yTile;
      fillTile(xTile,yTile,"#666666");

    }
  }
  //If something has been selected
  else{ 
    //Clear previously occupied tile
    fillTile(handleClick.tile.x,handleClick.tile.y,"#FFFFFF")
    //Fill in now occupied tile
    fillTile(xTile,yTile,"#000000");
    tiles[handleClick.tile.x][handleClick.tile.y].occupant = 0;
    tiles[xTile][yTile].occupant = 1;
    //Nothing is selected anymore
    handleClick.midMove = false;
    handleClick.tile.x = -1;
    handleClick.tile.y = -1;
  }

}

function fillTile(x,y,color){

  ctx.fillStyle=color;
  ctx.fillRect(tiles[x][y].x,tiles[x][y].y,TILE_WIDTH,TILE_HEIGHT);
  ctx.strokeRect(tiles[x][y].x,tiles[x][y].y,TILE_WIDTH,TILE_HEIGHT);
   
}