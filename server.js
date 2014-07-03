var app = require('./app');
var util = require("util");
var socketio = require("socket.io");
var Player = require("./player").Player;
var io;

var socket;
var pieces;
var players;
var turn; //whose turn is it!

//Initialize server
function init(server){
	pieces = [];
	players = [];

	io = socketio.listen(server);

	// limits Socket.IO to using WebSockets and not falling back to anything else.
	io.set("transports",["websocket"]);
	//io.set("log level", 1);

	setEventHandlers();
}

//Set up handlers for socket events
function setEventHandlers(){
	io.sockets.on("connection", onSocketConnection);
}

//what happens when a client connects
function onSocketConnection(client){
	util.log("New player has connectied: " + client.id);
	client.emit("your id", client.id);
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("move player", onMovePlayer);
	client.on("piece change", onPieceChange);

}

//When a client disconnects, destroy their player object
function onClientDisconnect() {
	var removePlayer = playerById(this.id);
	if(!removePlayer){
		util.log("Player not found while trying to remove " + this.id);
		return;
	}
	players.splice(players.indexOf(removePlayer),1);
	this.broadcast.emit("remove player", {id:this.id});
  util.log("Player has disconnected: "+this.id);
};

//Create a new player
function onNewPlayer(data) {
	
	//associate the client id with the player id, makes things simple
	var newPlayer = new Player(this.id);

		//Pick the person whose turn it is to start once there's two players
		//Players.length should be = 1 because that means one person has already connected
		//and the second person is connecting now. We don't push this player until the end.
	if(players.length == 1 && Math.floor(Math.random()*2)){
		turn = players[0].id;
	}
	else{
		turn = newPlayer.id;
	}
	newPlayer.minions = data.minions;
	//Send the new player to all existing players
	this.broadcast.emit("new player", {"id": newPlayer.id, "minions": newPlayer.minions, "firstTurn": newPlayer.id==turn});
	var existingPlayer;
	//Send all existing players to this new player
	for(i = 0; i < players.length; i++){
		existingPlayer = players[i];
		this.emit("new player", {"id": existingPlayer.id, "minions": existingPlayer.minions, "firstTurn": existingPlayer.id==turn});
	}
	//It's important to point out that this.broadcast.emit sends a messages to all clients
	//bar the one we're dealing with, while this.emit send a message only to the client we're
	//dealing with.

	players.push(newPlayer);
};

//When a move is made
function onMovePlayer(data) {
	var minion = minionByXYandID(data.x1, data.y1, this.id);
	minion.xTile = data.x2;
	minion.yTile = data.y2;
	this.broadcast.emit("move player", {"x1": data.x1, "y1": data.y1, "x2": data.x2, "y2": data.y2});
};

//All you need to do is forward the data to the other client
function onPieceChange(data){
	this.broadcast.emit("piece change", data);
}

function playerById(id){
	for(var i = 0; i < players.length; i++){
		if(players[i].id == id)
			return players[i];
	}
	return false;
}

function minionByXYandID(x,y,id){
	var player = playerById(id);
	for(var i in player.minions){
		if(x == player.minions[i].xTile && y == player.minions[i].yTile)
			return player.minions[i];
	}
	return false;
}

module.exports = { init: init };