let socket = io();

document.addEventListener("DOMContentLoaded", function(event) {  
    checkCookie();
    setTimeout(function(){
        document.getElementById('overlay').style.display = 'none';
    },100);
    function room(name,pass,numPlayers,isTaken){
            this.name = "";
            this.pass = "";
            this.players = [];
    }
    let rooms = [];

    document.getElementById('create').addEventListener('click',()=>{
        if(document.getElementById('createRoomPass').value != "" && document.getElementById('createRoomName').value != "" && getCookie('isInRoom') == 0){ 
            let name2 = document.getElementById('createRoomName').value;
            let pass2 = document.getElementById('createRoomPass').value;
            socket.emit('createRoom',name2,pass2);
        }

        else if(getCookie('isInRoom') == 1){
            alert("You're already in a room.\nPlease join the current room and leave it first.");
        }
    });

    socket.on('roomAlreadyExists',(rName,rPass)=>{
        alert('A room by the name of ' + rName + ' already exists.\nPlease select a different room name.');
    });

    socket.on('roomNotExists',(rName,rPass)=>{
        setCookie("roomName",rName);
        setCookie("roomPass",rPass);
        setCookie("isInRoom",1);
        socket.emit('createRoomJoin',rName,rPass,getCookie('playerName'));
        window.location.href = "/game";
    });

    document.getElementById('joinCurRoom').addEventListener('click',()=>{
        if(getCookie('isInRoom') == 1){
            window.location.href = "/game";
        }
        else{
            alert("You are currently not a part of any room.");
        }
    });
});

//_____________________________________________________COOKIE FUNCTIONS ______________________________________________________________________

function setCookie(cname,cvalue,exdays) {
    document.cookie = cname + "=" + cvalue;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    let playerName=getCookie("playerName");
    if (playerName != "") {
        document.getElementById('pName').innerHTML = playerName;
        document.getElementById('curRoom').innerHTML = getCookie('roomName');
    } 
    else{
        while(!playerName){
            playerName = prompt('Enter your in-game username');
            document.getElementById('pName').innerHTML = playerName;
        };
        setCookie("playerName", playerName);
        setCookie('isInRoom',0);
    }
}

