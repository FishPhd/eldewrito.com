var totalPlayers=0;

if (!window.callbacks) window.callbacks = { //not in-game, give helper callbacks
    connect: function (address) {
        prompt('Use the browser in-game\nOr type/paste this in the console (F1 or `)', 'server.connect ' + address);
    },
    def: true
};
 
$(document).ready(function() {
    updateServerList();
    masterserverLoop();
});
 
var masterServers = [{		
        "list": "http://eldewrito.red-m.net/list",		
        "announce": "http://eldewrito.red-m.net/announce",		
        "stats": "http://eldewrito.red-m.net/stats"		
    }], currentMS = 0, startMS = currentMS;
 
function getServerList(success, ms) {
    if (typeof ms !== 'number') ms = startMS = currentMS;
    ms = Math.min(Math.max(0, ms), masterServers.length);
    $.ajax({
        url: "http://eldewrito.red-m.net/list",
        dataType: 'json',
        jsonp: false,
        success: function () {
            if (currentMS != ms) console.log('Now using http://eldewrito.red-m.net/list');
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
    $('#serverlist > tbody  > tr').each(function(index){
        //alert(this.id);
        $.ajax({
                url: "http://" + this.id,
                dataType: 'json',
                jsonp: false,
                timeout: 3000,
                error: function () {
                    //alert(index + " Does not exist");
                    if(index!=0)
                        document.getElementById("serverlist").deleteRow(index);
                }
       });
    });
    
    getServerList(function( data ) {
        if(data.result.code != 0) {
            alert("Error received from master: " + data.result.msg);
            return;
        }
        console.log(data);
        if(data.result.servers.length == 0){
            document.getElementById("players-online").innerHTML = "No Servers!";
        }
        for(var i = 0; i < data.result.servers.length; i++) {
            var serverIP = data.result.servers[i];
            queryServer(serverIP);
        }
    });
    
    if(totalPlayers==0)
        document.getElementById("players-online").innerHTML = "Loading";
    else    
        document.getElementById("players-online").innerHTML = totalPlayers + " Players Online";
    totalPlayers=0;
}
   
function queryServer(serverIP) {
    console.log(serverIP);
    
    if (!validateIP(serverIP)) return; //this makes more sense here
    var startTime = Date.now();
    $.getJSON("http://" + serverIP, function(serverInfo) {
       var teamScore1=0;
       var teamScore2=0;
       totalPlayers+=serverInfo.numPlayers;
       var timeTaken = Date.now() - startTime;
       console.log(timeTaken);
       if(serverInfo.name === undefined) return;
       var isPassworded = serverInfo.passworded !== undefined;
       //if no serverInfo.map, they jumped into an active game without unannouncing their server, causing a duplicate unjoinable game
       if(!serverInfo.map) return;
       $.each(serverInfo.players, function () {
            if(this["team"]==0 && serverInfo.teams == "true")
                teamScore1+=this['score'];
            else if(this["team"]==1 && serverInfo.teams == "true")
                teamScore2=this['score'];
            else{
                teamScore1=-1;
                teamScore2=-1;
            }
        });
        //if any variables include js tags, skip them
        if(!invalidServer(serverInfo.name, serverInfo.variant, serverInfo.variantType, serverInfo.mapFile, serverInfo.maxPlayers, serverInfo.numPlayers, serverInfo.hostPlayer)) {
            $.ajax({
                url: 'http://ip-api.com/json/' + serverIP.split(':')[0],
                dataType: 'json',
                jsonp: false,
                timeout: 4000,
                success: function (geoloc) {
                    addServer(serverIP, isPassworded, serverInfo.name, serverInfo.hostPlayer, 
                    serverInfo.map, serverInfo.mapFile, serverInfo.variant, serverInfo.status, serverInfo.numPlayers, 
                    serverInfo.maxPlayers, serverInfo.eldewritoVersion, timeTaken, geoloc, teamScore1, teamScore2);
                    console.log(serverInfo);
                },
                error: function () {
                    addServer(serverIP, isPassworded, serverInfo.name, serverInfo.hostPlayer,
                     serverInfo.map, serverInfo.mapFile, serverInfo.variant, serverInfo.status,
                      serverInfo.numPlayers, serverInfo.maxPlayers, serverInfo.eldewritoVersion, timeTaken, null, teamScore1, teamScore2);
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
 
function addServer(ip, isPassworded, name, host, map, mapfile, gamemode, status, numplayers, maxplayers, version, ping, geoloc, teamScore1, teamScore2) {
    name = sanitizeString(name).substring(0,50);
    host = sanitizeString(host).substring(0,50);
    map = sanitizeString(map).substring(0,50);
    mapfile = sanitizeString(mapfile).substring(0,50);
    gamemode = sanitizeString(gamemode).substring(0,50);
    status = sanitizeString(status).substring(0,50);
    numplayers = parseInt(numplayers);
    teamScore1 = parseInt(teamScore1);
    teamScore2 = parseInt(teamScore2);
    maxplayers = parseInt(maxplayers);
    version = sanitizeString(version).substring(0, 10);
    
    var servInfo = "<td></td>";
    var servName = "<td id=\x22"+ip+"\x22>" + name  + "</br> <b>(" +  host + "</b>)</td>";
    var servMap = "<td id=\x22Map"+ip+"\x22>" + map + "</br> <b> (" + mapfile + "</b>)</td>";
    var servGameType = "<td id=\x22GameType"+ip+"\x22>" + gamemode + "</br>" + "</td>";
    //var servIP = "<td>" + ip + "</td>";
    var servStatus = "<td id=\x22Status"+ip+"\x22>" + status + "</td>";
    var servPlayers = "<td id=\x22Players"+ip+"\x22>" + numplayers + "/" + maxplayers + "</td>";
    var servGeoip="<td id=\x22GeoIP"+ip+"\x22>Loading</td>";
    var servVersion="<td></td>";
    var servScore="<td style=\x22text-align: center;\x22><span id=\x22Score1"+ip+"\x22 style=\x22color: #FD5F5F;font-weight: bold; font-family: lato;\x22>" + teamScore1 + "</span> - <span id=\x22Score2"+ip+"\x22 style=\x22color: cyan; font-weight: bold; font-family: lato;\x22>" + teamScore2 + "</span></td>";
    //var servScore="<td id=\x22Score"+ip+"\x22>" + teamScore1 + "</td>";
    
    if (version) servVersion = "<td>" + version + "</td>";;
    
    if (isPassworded) servInfo = '<td>\uD83D\uDD12</td>'; 
    
    if(teamScore1==-1 || teamScore2==-1) 
        servScore="<td style=\x22text-align: center;\x22><span id=\x22Score"+ip+"\x22 style=\x22font-weight: bold; font-family: lato;\x22>FFA</span></td>";
    
    if (geoloc && geoloc.regionName && geoloc.countryCode) 
        servGeoip = "<td id=\x22GeoIP"+ip+"\x22>" + geoloc.regionName + "</br> <b>" + geoloc.countryCode +"</b>";
    else if(geoloc && geoloc.countryCode && !geoloc.regionName) 
        servGeoip = "<td id=\x22GeoIP"+ip+"\x22>" + geoloc.countryCode + "</td>";
    else if(geoloc && geoloc.regionName && !geoloc.countryCode) 
        servGeoip = "<td id=\x22GeoIP"+ip+"\x22>" + geoloc.regionName + "</td>";
    else
        servGeoip = "<td id=\x22GeoIP"+ip+"\x22>Service Down</td>";
    
    if(status=="Loading") servGameType = "<td>" + "(Loading)" + "</td>";
    else if(status=="InLobby") servGameType = "<td>" + "(InLobby)" + "</td>";
    else if(status==null) servGameType = "<td>" + "(Unkown)"  + "</td>";
    
    var onclick = (isPassworded ? 'promptPassword' : 'callbacks.connect') + "('" + ip + "');";
   
    if(document.getElementById(ip) == null){ 
        $('#serverlist > tbody').append("<tr id=\x22" + ip +  "\x22 onclick=\"" + onclick + "\">" + servInfo + servName  + servGameType + servMap +  servPlayers + servStatus + servGeoip + servScore + "</tr>");
    }else{
        document.getElementById("Players"+ip).innerHTML = numplayers + "/" + maxplayers;
        //document.getElementById(ip).innerHTML = name  + "</br> <b>(" +  host + "</b>)";
        document.getElementById("Map"+ip).innerHTML = map + "</br> <b> (" + mapfile + "</b>)";    
        document.getElementById("GameType"+ip).innerHTML = gamemode + "</br>"; 
        
        if(teamScore1==-1 || teamScore2==-1)
             document.getElementById("Score"+ip).innerHTML = "FFA";
              
        document.getElementById("Score1"+ip).innerHTML = teamScore1;  
        document.getElementById("Score2"+ip).innerHTML = teamScore2;
        
        if(status=="Loading") document.getElementById("Status"+ip).innerHTML = "Loading";
        else if(status=="InLobby") document.getElementById("Status"+ip).innerHTML = "InLobby";
        else document.getElementById("Status"+ip).innerHTML = status;
        
        if (geoloc && geoloc.regionName && geoloc.countryCode) 
            document.getElementById("GeoIP"+ip).innerHTML = geoloc.regionName + "</br> <b>" + geoloc.countryCode +"</b>";
        else if(geoloc && geoloc.countryCode && !geoloc.regionName)                           
            document.getElementById("GeoIP"+ip).innerHTML = geoloc.countryCode;
        else if(geoloc && geoloc.regionName && !geoloc.countryCode)         
            document.getElementById("GeoIP"+ip).innerHTML = geoloc.regionName;   
        else
            document.getElementById("GeoIP"+ip).innerHTML = "Service Down";                                             
    }
}
 
function masterserverLoop() {
    setInterval(updateServerList, 2000);  
}