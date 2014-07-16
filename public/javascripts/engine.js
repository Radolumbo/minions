////////////////////////////////////////FIELD SET UP//////////////////////////////////////

//Pre-define certain values
var FIELD_SIZE = 800;
var MAX_TILES = fieldLength; //From set Options
var TILE_HEIGHT = FIELD_SIZE/MAX_TILES;
var TILE_WIDTH = FIELD_SIZE/MAX_TILES;

//current workarounds
var tiles; //The tiles on the board
var socket; //The socket via which connection with the server is established
var canvas; //The canvas being rendered
var ctx; //The context of the canvas -- used to draw on the canvas
var myTurn; //Is it my turn?
var remotePlayer; //The opponent
var localPlayer; //You
//Based on IDs, are you "player1"? this is used for image rendering
//e.g. player1 will have all "red" pieces and player2 will have all "green" pieces
var playerNumber; 
var pieces = []; // All the pieces on the board
var freePlay = false;
var gameOver = false;


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
  canvas.addEventListener("mousedown", handleMouseDown, false);
  canvas.addEventListener("mouseup", handleMouseUp, false);


  initCanvas(); //draw that stuff

  //Create the local player
  localPlayer = new Player(0); //I guess I'll use 0 as the ID for the local player for now, but I want it from the server
  for(var i in pieceSet){
    var newMinion = new Minion(pieceSet[i].image); //THIS IS BAD B/C YOU NEED TO ADD PLAYER NUMBER AND .PNG TO IMAGE FOR IT TO MAKE SENSE
    newMinion.motion = pieceSet[i].motion;
    newMinion.job = pieceSet[i].job;
    localPlayer.addMinion(newMinion);
    pieces[pieces.length] = newMinion; //Set the piece hash
    tiles[pieceSet[i].startingX][pieceSet[i].startingY].occupant = pieces.length - 1; //Set the tile occupant
    newMinion.xTile = pieceSet[i].startingX;
    newMinion.yTile = pieceSet[i].startingY;
  } 
  //Open connection AFTER generating player so we have something to send
  //Also don't make a connection if we're doing free play, ya dig?
  if(!freePlay)
    connectToServer();

}

/////////////////////////////////////////CONNECTION/////////////////////////////////////////

function connectToServer(){
  //TODO:
  //workaround for working between localhost and radolumbo TEMPORARY
  if(window.location.host=="localhost:3000"){
    socket = io.connect("http://localhost/", {port: 3000, transports: ["websocket"]});
  }
  else{
    socket = io.connect("http://radolumbo.herokuapp.com/game", {port: 3000, transports: ["websocket"]});
  }
  socket.on("connect", onSocketConnected); //When this client connects
  socket.on("disconnect", onSocketDisconnect); //When this client disconnects
  socket.on("new player", onNewPlayer);
  socket.on("move player", onMovePlayer);
  socket.on("remove player", onRemovePlayer);
  socket.on("your id", function(data){localPlayer.id = data;}); //RECEIVE YOUR ID
  socket.on("piece change", onPieceChange);
  socket.on("wait", function(){myTurn = false;
        document.getElementById("whoseTurn").innerHTML = 'THEIR TURN!';
  });
  socket.on("continue", function(){myTurn = true;
      document.getElementById("whoseTurn").innerHTML = 'YOUR TURN!';
  });
  socket.on("game over", onGameOver);
}

function onSocketConnected(){
  
  console.log("Connected to socket server");
};

function onSocketDisconnect(){
  console.log("Disconnected from socket server");
};

//When the opponent connects TODO: todo: 
function onNewPlayer(data){
  console.log("New player connected: "+data.id);
  var newPlayer = new Player(data.id);
  remotePlayer = newPlayer;
  //Determine whose turn it is
  myTurn = !data.firstTurn;
  //Determine who is player one and two
  playerNumber = myTurn ? 1:2;

  //now we can place the pieces on the board
  //Our minions need to have their image source updated with the proper player number
  for(var i in localPlayer.getMinions()){
    localPlayer.getMinions()[i].image.src = pieceSet[i].image + playerNumber + ".png"; //bad workaround
  }
  //Opinion's minions
  for(var x in data.minions){
    var newMinion = new Minion(data.minions[x].image + (3-playerNumber) + ".png"); //3 - playerNumber gives 2 for 1 and 1 for 2
    newMinion.xTile = (MAX_TILES-1) - data.minions[x].xTile;
    newMinion.yTile = (MAX_TILES-1) - data.minions[x].yTile;
    newMinion.mine = false;
    newMinion.job = data.minions[x].job;
    eval("newMinion.motion = " + data.minions[x].motion); //motion is sent over as a string, its dumb, oh well
    remotePlayer.addMinion(newMinion);
    pieces[pieces.length] = newMinion; //Set the piece hash
    tiles[newMinion.xTile][newMinion.yTile].occupant = pieces.length-1;
  }
  if(myTurn)
    document.getElementById("whoseTurn").innerHTML = 'YOUR TURN!';
  else
    document.getElementById("whoseTurn").innerHTML = 'THEIR TURN!';

  //Start up the special rule checks!
  setInterval(checkSpecialRules, 30);

  //Hide the waiting modal
  $("#waitingModal").modal("hide");

};

//the opponent moved :O
function onMovePlayer(data) {
  //Now it's your turn!
  myTurn = true;
  document.getElementById("whoseTurn").innerHTML = 'YOUR TURN!';
  //to make the board inverted:
  movePiece((MAX_TILES-1)-data.x1,(MAX_TILES-1)-data.y1,(MAX_TILES-1)-data.x2,(MAX_TILES-1)-data.y2);
};

function onRemovePlayer(data) {
  var removePlayer = remotePlayer;
  if(!removePlayer){
    console.log("something went horribly wrong, could not find opponent " + data.id);
    return;
  }
  if(!gameOver)
    alert("The opponet left! What a jerk!");
  remotePlayer = null;
};

//Handle an event where a piece changes without moving or attack
function onPieceChange(data){
  //The image is being changed
  if(data.image)
    pieces[tiles[(MAX_TILES-1)-data.x][(MAX_TILES-1)-data.y].occupant].image.src = data.image;
  //The job is being changed
  if(data.job)
    pieces[tiles[(MAX_TILES-1)-data.x][(MAX_TILES-1)-data.y].occupant].job = data.job;
  //Motion is being changed
  if(data.motion)
    eval("pieces[tiles[(MAX_TILES-1)-data.x][(MAX_TILES-1)-data.y].occupant].motion = " + data.motion);

}

function onGameOver(data){
  gameOver = true;
  $("#modals").append(
    '<div class="modal fade" id="gameoverModal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">\n'
    + '<div class="modal-dialog">\n'
      + '<div class="modal-content">\n'
        + '<div class="modal-body">\n'
          + data.message + '\n'
            + '<a href="/matches">Go home, you&#39;re drunk.</a>'
        + '</div>\n'
      + '</div>\n'
    + '</div>\n'
  + '</div>');
  $("#gameoverModal").modal("show");
  socket.close();
}

/////////////////////////////////////////CANVAS///////////////////////////////////////



//Create the grid
function initCanvas(){
  var field = createField(MAX_TILES);
  tiles = field.tiles;
}

function render(){
  //First, draw every tile
  for(var i in tiles){
    for(var j in tiles[i]){
      fillTile(i,j,"#FFFFFF");
    }
  }

  //Render every piece on every tile
  for(var i = 0; i < MAX_TILES; i++){
    for(var j = 0; j < MAX_TILES; j++){
      //If the tile is occupied, draw what is occupying it
      if(tiles[i][j].occupant > -1){
        var piece = pieces[tiles[i][j].occupant];
        //If this piece is being dragged, don't draw it
        if(drag.piece == piece){
          fillTile(i,j,"#FFFFFF"); //Just leave this spot empty
        }
        else if(piece.image.ready){

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

  //Draw the piece being dragged, if there is one
  if(drag.active){
    //The image should be centered around the mouse--this finds the corner to start drawing from
    var cornerX = drag.x - TILE_HEIGHT/2;
    var cornerY = drag.y - TILE_HEIGHT/2;
    var isAttack = document.getElementById("attackButton").checked;
    //Highlight valid move range
    drag.piece.highlightPattern(isAttack);
    //Draw piece mid-drag
    drawOutsideTile(cornerX, cornerY, drag.piece.image);
  }


}

///////////////////////////////////////CLICK EVENT//////////////////////////////////////////


//Handle a click event
function handleClick(e){
  e.preventDefault();

  if(!myTurn)
    return;

  //WE DON'T WANT TO HAVE THIS FUNCTION RUN IF A DRAG IS HAPPENING
  var passedTime = new Date().getTime() - drag.timestamp;
  //If it's been greater than 300ms, it's probably a drag, not a click
  if(passedTime > 300){
    return; 
  }

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
    if(tiles[xTile][yTile].occupant > -1 && pieces[tiles[xTile][yTile].occupant].mine){
      handleClick.midMove = true;
      handleClick.tile.x = xTile;
      handleClick.tile.y = yTile;
      handleClick.piece = selectPiece(xTile, yTile);
    }
    //There was a minion, but it's not yours. Still update the menu.
    else if(tiles[xTile][yTile].occupant > -1){
      updateMenu(pieces[tiles[xTile][yTile].occupant]);
    }
  }
  //If something has been selected
  else{ 
    //Make sure its being moved within its range
    var isAttack = document.getElementById("attackButton").checked;
    //Move the piece
    if(!isAttack && validMove(xTile,yTile,handleClick.piece.selectPattern(false),false)){
      var successfulMove = movePiece(handleClick.tile.x,handleClick.tile.y,xTile,yTile);
      //Send message that this piece was moved
      if(successfulMove){
        socket.emit("move player", {"x1": handleClick.tile.x, "y1": handleClick.tile.y, "x2": xTile, "y2": yTile});
        deselectPiece(xTile, yTile);
        myTurn = !successfulMove; //Only surrender turn if move was successful
        document.getElementById("whoseTurn").innerHTML = 'THEIR TURN!';
      }
    }
    //Attempt an attack
    else if(isAttack && validMove(xTile,yTile,handleClick.piece.selectPattern(true),true)){
      //There's a target
      if(tiles[xTile][yTile].occupant > -1 && !(xTile == handleClick.tile.x && yTile == handleClick.tile.y)){
        var successfulMove = attackMinion(handleClick.piece,pieces[tiles[xTile][yTile].occupant]);
        deselectPiece(handleClick.tile.x, handleClick.tile.y)
        myTurn = !successfulMove;
        document.getElementById("whoseTurn").innerHTML = 'THEIR TURN!';
      }
      //The attack was in range, but there was no target
      else{
        deselectPiece(handleClick.tile.x, handleClick.tile.y);
        handleClick.midMove = false;
        handleClick.tile.x = -1;
        handleClick.tile.y = -1;
        handleClick.piece = null;
      }
    }
    //Else you clicked outside the valid range, deselect the piece
    else{
      deselectPiece(handleClick.tile.x, handleClick.tile.y);
      handleClick.midMove = false;
      handleClick.tile.x = -1;
      handleClick.tile.y = -1;
      handleClick.piece = null;
    }
    //Nothing is selected anymore
    if(successfulMove){
      handleClick.midMove = false;
      handleClick.tile.x = -1;
      handleClick.tile.y = -1;
      handleClick.piece = null;
    }
  }

}

//////////////////////////////////////////////DRAG AND DROP EVENTS/////////////////////////////////////////////
//Collectively, the 3 drag/drop events (mousedown,move,up) all alter this object to communicate info to one another
var drag = {
  "active": false,
  "x": -1,
  "y": -1,
  "piece": null,
  "timestamp": -1 //this is used to determine if we are doing a click or a drag
};

function handleMouseDown(e){
  if(!myTurn)
    return;
  //What's the time?
  drag.timestamp = new Date().getTime();

  //If we're in the middle of a click, ABORT
  if(handleClick.midMove)
    return;


  //X and Y of the click
  drag.x = e.pageX - canvas.offsetLeft;
  drag.y = e.pageY - canvas.offsetTop;

  //Which tile did I select?
  var xTile = Math.floor(MAX_TILES*drag.x/FIELD_SIZE);
  var yTile = Math.floor(MAX_TILES*drag.y/FIELD_SIZE);

  //If a minion is in the tile you just clicked
  if(tiles[xTile][yTile].occupant >-1 && pieces[tiles[xTile][yTile].occupant].mine){
    canvas.addEventListener("mousemove", handleMouseMove, false);
    drag.piece = selectPiece(xTile, yTile);
    drag.xTile = drag.piece.xTile;
    drag.yTile = drag.piece.yTile;
    drag.active = true;
  }
  //It's a minion, but it ain't yours. Still, show info in menu.
  else if(tiles[xTile][yTile].occupant > -1){
      updateMenu(pieces[tiles[xTile][yTile].occupant]);
  }

}

function handleMouseUp(e){
  if(!myTurn)
    return;
  //If a minion has been picked it up, drop it
  if(drag.active){
    //Which tile did I drop the piece?
    var xTile = Math.floor(MAX_TILES*drag.x/FIELD_SIZE);
    var yTile = Math.floor(MAX_TILES*drag.y/FIELD_SIZE);
    var isAttack = document.getElementById("attackButton").checked;
    //If it's a valid move, make it
    if(validMove(xTile,yTile,drag.piece.selectPattern(isAttack),isAttack)){
      //Send message that this piece was moved
      var successfulMove = movePiece(drag.xTile, drag.yTile, xTile, yTile);
      if(successfulMove)
        socket.emit("move player", {"x1": drag.xTile, "y1": drag.yTile, "x2": xTile, "y2": yTile});
      //Prevent a click event from happening if there was motion by setting the timestamp to -1
      //since click events check to see how much time passed from mousedown.
      drag.timestamp = -1;
      //Turn's over, boys
      myTurn = !successfulMove;
      if(!myTurn)
        document.getElementById("whoseTurn").innerHTML = 'THEIR TURN!';
    }
  }
  //Make sure to deselect the piece
  if(drag.piece){
    deselectPiece(drag.piece.xTile,drag.piece.yTile);
  }
  drag.piece = null;
  drag.x = -1;
  drag.y = -1;
  drag.xTile = -1;
  drag.yTile = -1;
  drag.active = false;
  canvas.removeEventListener("mousemove", handleMouseMove, false);

}

function handleMouseMove(e){
  //Update where the drag is
  if(drag.active){
    drag.x = e.pageX - canvas.offsetLeft;
    drag.y = e.pageY - canvas.offsetTop; 
  }
}

///////////////////////////////////////////FIELD MANIPULATION/////////////////////////////

//Draw somewhere that isn't within a tile
function drawOutsideTile(x,y,image){
  ctx.drawImage(image,x,y,TILE_WIDTH,TILE_HEIGHT);
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
  return minion;
}

function deselectPiece(x,y){
  var minion = pieces[tiles[x][y].occupant]; //minion is now the minion on selected tile
  minion.selected = false;
  //Update page to show nothing is selected
  var isAttack = document.getElementById("attackButton").checked;
  minion.clearPattern(isAttack); //need to move this into render somehow
  updateMenu(null);
}

//Check if [x,y] is in validTiles
function validMove(x,y,validTiles,isAttack){
  //For motion:
  if(!isAttack){
    //If it's occupied, you can't move there!... unless moving is attack.. but even if movingIsAttack, you still can't hit your own minions
    if(tiles[x][y].occupant > -1 && (!moveIsAttack || pieces[tiles[x][y].occupant].mine))
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

//Move a piece from x1,y1 to x2,y2
function movePiece(x1,y1,x2,y2){
  var mover = tiles[x1][y1].occupant; //mover holds the number of the selected piece

  //If move is attack on, and there's a target, ATTACK IT
  if(moveIsAttack && tiles[x2][y2].occupant > -1){
    attackMinion(pieces[mover],pieces[tiles[x2][y2].occupant])
  }

 
  //Update the Minion with its new location
  pieces[mover].xTile = x2;
  console.log(pieces[mover].xTile);
  pieces[mover].yTile = y2;
  //Update the tiles with their new occupants
  tiles[x1][y1].occupant = -1;
  tiles[x2][y2].occupant = mover;
  //Turn is over!

  return true; //move was successful
}

//What happens when a minion attacks?
function attackMinion(aggressor, defender){
  if(aggressor == undefined || defender == undefined)
    return false;
  defender.HP = defender.HP - aggressor.attackValue;
  //The minion dies
  if(defender.HP <= 0){
    tiles[defender.xTile][defender.yTile].occupant = -1;
    defender.x = -1;
    defender.y = -1;
    defender.alive = false;

  }
  return true; //move was successful
}

//////////////////////////////////////////////////////////UI INTERACTIONS////////////////////////////////////////////////////////////////////

function updateMenu(minion){
  if(!minion){
    document.getElementById("selectedPiece").innerHTML = "NOTHING SELECTED";
    return;
  }
  document.getElementById("selectedPiece").innerHTML = "Job: " + minion.job;
}

/////////////////////////////////////////////////"SPECIAL RULE THING"///////////////////////////////////////////////////////////////

function checkSpecialRules(){
  //Run all the special rule functions
  for(var i in specialRules){
    specialRules[i]();
  }
}