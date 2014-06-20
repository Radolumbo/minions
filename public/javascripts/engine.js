////////////////////////////////////////FIELD SET UP//////////////////////////////////////

//Pre-define certain values
var FIELD_SIZE = 800;
var MAX_TILES = 10;
var TILE_HEIGHT = FIELD_SIZE/MAX_TILES;
var TILE_WIDTH = FIELD_SIZE/MAX_TILES;

//current workarounds
var tiles;
var socket;
var canvas;
var ctx;
//var minion;
var remotePlayer;
var localPlayer;
var pieces = [];
//var pieces = {
  //1: new Minion("warrior", "images/warrior.png"),
  //2: new Minion("mage", "images/mage.png")
//};
//pieces[1].image.onload = function(){ pieces[1].imageReady = true; };
//pieces[2].image.onload = function(){ pieces[2].imageReady = true; };


///////////////////////////////////////////////////INITIALIZE///////////////////////////////////////////////////////
function initGame(){
  //Create the Canvas
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  var wrapper = document.getElementById("wrapper");
  canvas.width = FIELD_SIZE;
  canvas.height = FIELD_SIZE;
  wrapper.appendChild(canvas);
  canvas.addEventListener("click", handleClick, false);

  initCanvas(); //draw that stuff

  //Create the local player
  localPlayer = new Player(0); //I guess I'll use 0 as the ID for the local player for now, but I want it from the server
  localPlayer.addMinion(new Minion("warrior", "images/warrior.png"));
  localPlayer.getMinions()[0].image.onload = function(){ localPlayer.getMinions()[0].imageReady = true; };
  pieces[pieces.length+1] = localPlayer.getMinions()[0]; //this does not work!! use a count variable instead

  //Set pieces
  tiles[4][3].occupant = 1;
  pieces[1].xTile = 4;
  pieces[1].yTile = 3;
  //tiles[3][4].occupant = 2;
  //pieces[2].xTile = 3;
  //pieces[2].yTile = 4;

  //Open connection AFTER generating player so we have something to send
 // io.set('log level',false);
  socket = io.connect("http://radolumbo.herokuapp.com", {port: 3000, transports: ["websocket"]});
  socket.on("connect", onSocketConnected); //When this client connects
  socket.on("disconnect", onSocketDisconnect); //When this client disconnects
  socket.on("new player", onNewPlayer);
  socket.on("move player", onMovePlayer);
  socket.on("remove player", onRemovePlayer);


  //Image rendering
  /*var bgReady = false;
  var bgImage = new Image();
  bgImage.onload = function(){ bgReady = true; };
  bgImage.src = "images/bg1.png";
  var pReady = false;
  var pImage = new Image();
  pImage.onload = function(){ pReady = true; };
  pImage.src = "images/player.png";*/

  //Fire it up!
}

/////////////////////////////////////////CONNECTION/////////////////////////////////////////


function onSocketConnected() {
  socket.emit("new player", {"minions": extractMinions(localPlayer.getMinions())});
  console.log("Connected to socket server");
};

function onSocketDisconnect() {
  console.log("Disconnected from socket server");
};

//When the opponent connects TODO: todo: 
function onNewPlayer(data) {
  console.log("New player connected: "+data.id);
  var newPlayer = new Player(data.id);
  remotePlayer = newPlayer;
  //Add all the minions that this player owns
  for(var x in data.minions){
    var newMinion = new Minion(data.minions[x].job, "images/"+data.minions[x].job+".png");
    newMinion.xTile = (MAX_TILES-1) - data.minions[x].xTile;
    newMinion.yTile = (MAX_TILES-1) - data.minions[x].yTile;
    newMinion.image.onload = function(){ newMinion.imageReady = true; };
    remotePlayer.addMinion(newMinion);
  }
  //This is total bullshit right now just to force draw the new minions
  var oppMinion = remotePlayer.getMinions()[0];
  pieces[2] = oppMinion;
  //Set pieces
  tiles[oppMinion.xTile][oppMinion.yTile].occupant = 2;
};

//the opponent moved :O
function onMovePlayer(data) {
  movePiece((MAX_TILES-1)-data.x1,(MAX_TILES-1)-data.y1,(MAX_TILES-1)-data.x2,(MAX_TILES-1)-data.y2);
};

function onRemovePlayer(data) {
  var removePlayer = remotePlayer;
  if(!removePlayer){
    console.log("something went horribly wrong, could not find opponent " + data.id);
    return;
  }
  remotePlayer = null;
};

/////////////////////////////////////////CANVAS///////////////////////////////////////



//Draw the grid
function initCanvas(){
  var field = createField(MAX_TILES);
  tiles = field.tiles;
  for(var i in tiles){
    for(var j in tiles[i]){
      fillTile(i,j,"#FFFFFF")
    }
  }

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
      else{

      }
    }
  }


}

///////////////////////////////////////CLICK EVENTS//////////////////////////////////////////

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
      handleClick.piece = selectPiece(xTile, yTile);
    }
  }
  //If something has been selected
  else{ 
    //Make sure its being moved within its range
    var isAttack = document.getElementById("attackButton").checked;
    //Move the piece
    if(!isAttack && validMove(xTile,yTile,handleClick.piece.selectPattern(false),false)){
      movePiece(handleClick.tile.x,handleClick.tile.y,xTile,yTile);
      //Send message that this piece was moved
      socket.emit("move player", {"x1": handleClick.tile.x, "y1": handleClick.tile.y, "x2": xTile, "y2": yTile});
    }
    //Attempt an attack
    else if(isAttack && validMove(xTile,yTile,handleClick.piece.selectPattern(true),true)){
      //There's a target
      if(tiles[xTile][yTile].occupant && !(xTile == handleClick.tile.x && yTile == handleClick.tile.y)){
        attackMinion(handleClick.piece,pieces[tiles[xTile][yTile].occupant]);
      }
      //The attack was in range, but there was no target
      else{
        deselectPiece(handleClick.tile.x, handleClick.tile.y);
      }
    }
    //Else you clicked outside the valid range, deselect the piece
    else{
      deselectPiece(handleClick.tile.x, handleClick.tile.y);
    }
    //Nothing is selected anymore
    handleClick.midMove = false;
    handleClick.tile.x = -1;
    handleClick.tile.y = -1;
    handleClick.piece = null;
  }

}


///////////////////////////////////////////FIELD MANIPULATION/////////////////////////////

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
  return minion;
}

function deselectPiece(x,y){
  var minion = pieces[tiles[x][y].occupant]; //minion is now the minion on selected tile
  minion.selected = false;
  //Update page to show nothing is selected
  var isAttack = document.getElementById("attackButton").checked;
  minion.clearPattern(isAttack);
  updateMenu(null);
}

//Move a piece from x1,y1 to x2,y2
function movePiece(x1,y1,x2,y2){
  var temp = tiles[x1][y1].occupant; //temp holds the number of the selected piece
  //Piece is no longer selected
  deselectPiece(x1, y1);
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
function validMove(x,y,validTiles,isAttack){
  //For motion:
  if(!isAttack){
    //If it's occupied, you can't move there!
    if(tiles[x][y].occupant)
      return false;

    for(var index in validTiles){
      if(validTiles[index][0] == x && validTiles[index][1] == y)
        return true;
    }
    return false;
  }
  else{
    for(var index in validTiles){
      if(validTiles[index][0] == x && validTiles[index][1] == y)
        return true;
    }
  }
  return false;
}

function attackMinion(aggressor, defender){
  defender.HP = defender.HP - aggressor.attack;
  //The minion dies
  if(defender.HP <= 0){
    tiles[defender.xTile][defender.yTile].occupant = 0;
    defender.x = -1;
    defender.y = -1;
    defender.alive = false;

  }
  deselectPiece(aggressor.xTile, aggressor.yTile);
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

