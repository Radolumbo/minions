var app = require('./app');
var util = require("util");
var socketio = require("socket.io");
var Player = require("./player").Player;
var io;

var socket;
var pieces;
var matchToPlayers; //hash room id to player list
var turn; //whose turn is it!

var mongoUri = process.env.MONGOHQ_URL ||
								"localhost:27017/minions";

//Connect to mongo
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(mongoUri);

//Initialize server
function init(server){
	pieces = [];
	matchToPlayers = {};

	io = socketio.listen(server);

	// limits Socket.IO to using WebSockets and not falling back to anything else.
	io.set("transports",["websocket"]);
	//io.set("log level", 1);
	listingNSP = io.of("/matches");
	gameNSP = io.of("/game");

	setEventHandlers();
}

//Set up handlers for socket events
function setEventHandlers(){
	io.sockets.on("connection", onSocketConnection);
}

//what happens when a client connects
function onSocketConnection(client){
	util.log("New player has connected: " + client.id);
	client.emit("your id", client.id);
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("move player", onMovePlayer);
	client.on("piece change", onPieceChange);
	client.on("join room", onJoinRoom);
	client.on("wait", function(){this.broadcast.to(this.room).emit("wait")});
	client.on("continue", function(){this.broadcast.to(this.room).emit("continue")});
	client.on("game over", onGameOver);
}

//Join the room they want
function onJoinRoom(data){
	this.room = data.room;
	this.join(data.room);
	util.log("Player " + this.id + " has joined room " + JSON.stringify(this.room));
}

//When a client disconnects, destroy their player object
function onClientDisconnect() {
	//Don't delete player who isn't in a match
	if(this.room == "matchesPage"){
		util.log("Person left matches page: " + this.id);
		return;
	}
	var removePlayer = playerById(this.id,this.room);
	var players= matchToPlayers[this.room];
	if(!removePlayer){
		util.log("Player not found while trying to remove " + this.id);
		return;
	}
	players.splice(players.indexOf(removePlayer),1);
	this.broadcast.to(this.room).emit("remove player", {id:this.id});

	//Both players are gone, remove it from the hash
	if(players.length == 0){
		delete matchToPlayers[this.room];
	}

  util.log("Player has disconnected: "+this.id);
};

//Create a new player
function onNewPlayer(data) {
	var theClient = this;
	//associate the client id with the player id, makes things simple
	var newPlayer = new Player(this.id);
	//This is the first person to connect
	if(matchToPlayers[this.room] == undefined){
		matchToPlayers[this.room] = [];
		//tell the people on the matches page to create the match
		var matches = db.get('matches');
		matches.find({_id: this.room},function(err,docs){
			theClient.broadcast.to("matchesPage").emit("create match", {"id": docs[0]._id, "matchName": docs[0].matchName}); 
		});
	}
	//This is the second person to connect, remove match from DB
	else{
		var matches = db.get('matches');
		//Tell people on the matches page to delete the match 
		this.broadcast.to("matchesPage").emit("delete match", {"id": this.room}); 
		matches.remove({ _id : this.room}, function (err) {
			if(err){
				util.log("Failed to remove match " + this.room);
			}
		});

	}

	var players = matchToPlayers[this.room];
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
	this.broadcast.to(this.room).emit("new player", {"id": newPlayer.id, "minions": newPlayer.minions, "firstTurn": newPlayer.id==turn});
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
	var minion = minionByXYandID(data.x1, data.y1, this.id, this.room);
	minion.xTile = data.x2;
	minion.yTile = data.y2;
	this.broadcast.to(this.room).emit("move player", {"x1": data.x1, "y1": data.y1, "x2": data.x2, "y2": data.y2});
};

//All you need to do is forward the data to the other client
function onPieceChange(data){
	this.broadcast.to(this.room).emit("piece change", data);
}

function onGameOver(data){
	this.broadcast.to(this.room).emit("game over", data);
}

function playerById(id, match){
	var players = matchToPlayers[match];
	for(var i = 0; i < players.length; i++){
		if(players[i].id == id)
			return players[i];
	}
	return false;
}

function minionByXYandID(x,y,id,match){
	var player = playerById(id,match);
	for(var i in player.minions){
		if(x == player.minions[i].xTile && y == player.minions[i].yTile)
			return player.minions[i];
	}
	return false;
}

module.exports = { init: init };