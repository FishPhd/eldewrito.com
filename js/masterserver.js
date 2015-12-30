if (!window.callbacks) window.callbacks = { //not in-game, give helper callbacks
    connect: function (address) {
        prompt('Use the browser in-game\nOr type/paste this in the console (F1 or `)', 'server.connect ' + address);
    },
    def: true
};

$(document).ready(function() {
    //queryServer("192.99.124.162/list");
    //addServer("127.0.0.1:11775", "Test server", "emoose", "Guardian", "guardian", "Team Slayer", "1", "16");
    $("#refresh").click(function() {
        updateServerList();
    });
    updateServerList();
});

var masterServers = [
    {
        "list": "http://eldewrito.red-m.net/list",
        "announce": undefined, //red_m's server doesn't have these
        "stats": undefined
    },
    {
        "list": "http://192.99.124.162/list",
        "announce": "http://192.99.124.162/announce",
        "stats": "http://192.99.124.162/stats"
    },
    {
        "list": "http://samantha-master.halo.click/list",
        "announce": "http://samantha-master.halo.click/announce",
        "stats": "http://samantha-master.halo.click/stats"
    },
    {
        "list": "http://eldewrito-masterserver-thetwist84.c9.io/list",
        "announce": "http://eldewrito-masterserver-thetwist84.c9.io/announce",
        "stats": "http://eldewrito-masterserver-thetwist84.c9.io/stats"
    },
    {
        "list": "http://eldewrito-masterserver-1-thetwist84.c9.io/list",
        "announce": "http://eldewrito-masterserver-1-thetwist84.c9.io/announce",
        "stats": "http://eldewrito-masterserver-1-thetwist84.c9.io/stats"
    },
    {
        "list": "http://80.240.130.4:8117/list",
        "announce": "http://80.240.130.4:8117/announce",
        "stats": "http://80.240.130.4:8117/stats"
    },
    {
        "list": "http://eldewrito-masterserver-personality.c9.io/list",
        "announce": "http://eldewrito-masterserver-personality.c9.io/announce",
        "stats": "http://eldewrito-masterserver-personality.c9.io/stats"
    }
], currentMS = 0, startMS = currentMS;

function getServerList(success, ms) {
    if (typeof ms !== 'number') ms = startMS = currentMS;
    ms = Math.min(Math.max(0, ms), masterServers.length);
    $.ajax({
        url: masterServers[ms].list,
        dataType: 'json',
        jsonp: false,
        success: function () {
            if (currentMS != ms) console.log('Now using ' + masterServers[ms].list);
            currentMS = ms;
            success.apply(null, arguments);
        },
        error: function () {
            ms = (ms + 1) % masterServers.length;
            if (ms != startMS) getServerList(success, ms);
            else console.log('No master servers are available!'); //went full circle with no success
        }
    });
}

function updateServerList() {
    $("#serverlist > tbody").empty();

    getServerList(function( data ) {
        if(data.result.code != 0) {
            alert("Error received from master: " + data.result.msg);
            return;
        }
        console.log(data);
        for(var i = 0; i < data.result.servers.length; i++) {
            var serverIP = data.result.servers[i];
            queryServer(serverIP);
        }
    });
}
    
function queryServer(serverIP) {
    console.log(serverIP);
    if (!validateIP(serverIP)) return; //this makes more sense here
    var startTime = Date.now();
    $.getJSON("http://" + serverIP, function(serverInfo) {
        var timeTaken = Date.now() - startTime;
        console.log(timeTaken);
        if(serverInfo.name === undefined) return;
        var isPassworded = serverInfo.passworded !== undefined;
        //if no serverInfo.map, they jumped into an active game without unannouncing their server, causing a duplicate unjoinable game
        if(!serverInfo.map) return;
        
	    //if any variables include js tags, skip them
	    if(!invalidServer(serverInfo.name, serverInfo.variant, serverInfo.variantType, serverInfo.mapFile, serverInfo.maxPlayers, serverInfo.numPlayers, serverInfo.hostPlayer)) {
            $.ajax({
                url: 'http://www.telize.com/geoip/' + serverIP.split(':')[0],
                dataType: 'json',
                jsonp: false,
                timeout: 3000,
                success: function (geoloc) {
                    addServer(serverIP, isPassworded, serverInfo.name, serverInfo.hostPlayer, serverInfo.map, serverInfo.mapFile, serverInfo.variant, serverInfo.status, serverInfo.numPlayers, serverInfo.maxPlayers, serverInfo.eldewritoVersion, timeTaken, geoloc);
                    console.log(serverInfo);
                },
                error: function () {
                    addServer(serverIP, isPassworded, serverInfo.name, serverInfo.hostPlayer, serverInfo.map, serverInfo.mapFile, serverInfo.variant, serverInfo.status, serverInfo.numPlayers, serverInfo.maxPlayers, serverInfo.eldewritoVersion, timeTaken, null);
                    console.log(serverInfo);
                }
            });
        }
    });
}

function promptPassword(serverIP) {
    var password = prompt("The server at " + serverIP + " is passworded, enter the password to join", "");
    if(password)
        callbacks.connect(serverIP + ' ' + password);
    else if (callbacks.def)
        callbacks.connect(serverIP + ' <password>');
}

function sanitizeString(str) {
    return String(str).replace(/(<([^>]+)>)/ig,"") //shouldn't need to strip tags with the below replacements, but I'll keep it anyway
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/'/g, '&#39;')
                      .replace(/"/g, '&quot;');
}

function validateIP(str) {
    if (str) {
        str = String(str);
		if(/^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)(?:\:(?:\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/i.test(str)) {
			return true;
		} else{
			console.log(str + " is not a valid ip, skipping");
			return false;
		}
	} else {
    	console.log(str + " is not a valid ip, skipping");
        return false;
	}
}

function invalidServer() {
    if (/[<>]/.test(Array.prototype.slice.call(arguments).join(''))) {
        console.log("Javascript potentially in one of the variables, skipping server");
        return true;
    } else {
        return false;
    }
}

function addServer(ip, isPassworded, name, host, map, mapfile, gamemode, status, numplayers, maxplayers, version, ping, geoloc) {
    //because people can't be trusted with html, filter it out
    name = sanitizeString(name).substring(0,50);
    host = sanitizeString(host).substring(0,50);
    map = sanitizeString(map).substring(0,50);
    mapfile = sanitizeString(mapfile).substring(0,50);
    gamemode = sanitizeString(gamemode).substring(0,50);
    status = sanitizeString(status).substring(0,50);
    numplayers = parseInt(numplayers);
    maxplayers = parseInt(maxplayers);
    version = sanitizeString(version).substring(0, 10);

    if (geoloc && geoloc.country_code) name = '[' + sanitizeString(geoloc.country_code) + (geoloc.region_code ? '-' + sanitizeString(geoloc.region_code) : '') + '] ' + name;

    if (isPassworded) name = '[\uD83D\uDD12] ' + name;

    if (version) name = '[' + version + '] ' + name;

    var servName = "<td>" + name  + " <b>(" +  host + "</b>)" + "</td>";
    var servMap = "<td>" + map + " (" + mapfile + ")" +  "</td>";
    var servGameType = "<td>" + gamemode + "</br>" + "</td>";
    var servIP = "<td>" + ip + "</td>";
    var servStatus = "<td>" + status + "</td>";
    var servPlayers = "<td>" + numplayers + "/" + maxplayers + "</td>";
    
    var onclick = (isPassworded ? 'promptPassword' : 'callbacks.connect') + "('" + ip + "');";

    //$('#serverlist tr:last').after
    $('#serverlist > tbody').append("<tr onclick=\"" + onclick + "\">" + servName + servIP + servGameType + servMap +  servPlayers + "</tr>");
}