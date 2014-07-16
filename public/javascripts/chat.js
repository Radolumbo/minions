function initChat(){
  socket.on("chat message", onNewMessage); //When this client connects
}

function onNewMessage(data){
	$('#chatbox').append("<p>Zer: " + data + "</p>");
	var elem = document.getElementById('chatbox');
  elem.scrollTop = elem.scrollHeight;
}

  