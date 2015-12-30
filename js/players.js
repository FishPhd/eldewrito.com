/*
    (c) 2015 Brayden Strasen & Ryan Palmer
    https://creativecommons.org/licenses/by-nc-sa/4.0/
*/

$(document).ready(function () {
	initalizePlayerCount();
});

function initalizePlayerCount() {
	getTotalPlayers();
	totalPlayersLoop();
}

function getTotalPlayers() {
	var totalPlayers = 0;
	getServerList(function(data) {
		for (var i = 0; i < data.result.servers.length; i++) {
			var serverIP = data.result.servers[i];
			if (validateIP(serverIP))
				$.getJSON("http://" + serverIP, function(serverInfo) {
					totalPlayers += serverInfo.numPlayers;
					console.log(totalPlayers);
					$('#players-online').text(totalPlayers + " Players Online");
				});
		}
	});
}

function totalPlayersLoop() {
	setInterval(getTotalPlayers, 30000);
}
