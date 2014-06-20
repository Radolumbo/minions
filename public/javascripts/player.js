function Player(pid){
	this.id = pid;
	var minions = [];

	this.getMinions = function(){
		return minions;
	};

	this.addMinion = function(minion){
		minions.push(minion);
	}

};