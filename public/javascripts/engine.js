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
  1: new Minion("warrior", "images/warrior.png"),
  2: new Minion("mage", "images/mage.png")
};
pieces[1].image.onload = function(){ pieces[1].imageReady = true; };
pieces[2].image.onload = function(){ pieces[2].imageReady = true; };


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

  //Set pieces
  tiles[0][0].occupant = 1;
  pieces[1].xTile = 0;
  pieces[1].yTile = 0;
  tiles[9][9].occupant = 2;
  pieces[2].xTile = 9;
  pieces[2].yTile = 9;
}

function render(){
  //Render every piece on every tile
  for(var i = 0; i < MAX_TILES; i++){
    for(var j = 0; j < MAX_TILES; j++){
      //If the tile is occupied, draw what is occupying it
      if(tiles[i][j].occupant){
        var piece = pieces[tiles[i][j].occupant];
        if(piece.imageReady){

          //If the piece is selected, highlight it and its range
          if(piece.selected){
            alterDrawTile(i,j,piece.image);
            //Pass false if move, pass true if attack
            var isAttack = document.getElementById("attackButton").checked;
            piece.clearPattern(!isAttack); //Necessary in case user is switching between attack and move mid-select
            piece.highlightPattern(isAttack);
          }
          //Else the piece is not selected, draw it normally
          else{
            drawTile(i,j,piece.image);
          }

        }
      }
    }
  }


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
    var isAttack = document.getElementById("attackButton").checked;
    if(validMove(xTile,yTile,handleClick.piece.selectPattern(isAttack))){
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

//Fill a specified tile a specified image
function drawTile(x,y,image){
  ctx.drawImage(image,tiles[x][y].x,tiles[x][y].y,TILE_WIDTH,TILE_HEIGHT);
   
}

//Alter the image and then draw it in a tile
function alterDrawTile(x,y,image){
  ctx.drawImage(image,tiles[x][y].x,tiles[x][y].y,TILE_WIDTH,TILE_HEIGHT);
  var imageData = ctx.getImageData(tiles[x][y].x,tiles[x][y].y,TILE_WIDTH,TILE_HEIGHT);
  var data = imageData.data;
  for(var i = 0; i < data.length; i += 4) {
    // red
    data[i] = 255 - data[i];
    // green
    data[i + 1] = 255 - data[i + 1];
    // blue
    data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(imageData,tiles[x][y].x,tiles[x][y].y);
}

//Select a piece
function selectPiece(x,y){
  var minion = pieces[tiles[x][y].occupant]; //minion is now the minion on selected tile
  minion.selected = true;
  //Update page to show selected thing
  updateMenu(minion);
}

//Move a piece from x1,y1 to x2,y2
function movePiece(x1,y1,x2,y2){
  var temp = tiles[x1][y1].occupant; //temp holds the number of the selected piece
  //Clear the highlighting from the piece being selected for motion
  var isAttack = document.getElementById("attackButton").checked;
  pieces[temp].clearPattern(isAttack);
  //Piece is no longer selected
  pieces[temp].selected = false;
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

  updateMenu(null);
}

//Check if [x,y] is in validTiles
function validMove(x,y,validTiles){
  //If it's occupied, you can't move there!
  if(tiles[x][y].occupant)
    return false;

  for(var index in validTiles){
    if(validTiles[index][0] == x && validTiles[index][1] == y)
      return true;
  }
  return false;
}


//////////////////////////////////////////////////////////UI INTERACTIONS////////////////////////////////////////////////////////////////////

function updateMenu(minion){
  if(!minion){
    document.getElementById("selectedPiece").innerHTML = "NOTHING SELECTED";
    return;
  }
  document.getElementById("selectedPiece").innerHTML = "Job: " + minion.job + "<br>"
                                                     + "Movement range: " + minion.motionRange + "<br>"
                                                     + "Attack range: " + minion.attackRange;
}

