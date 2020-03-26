document.addEventListener("DOMContentLoaded", function(event) {  
    checkCookie();
    setTimeout(function(){
        document.getElementById('overlay').style.display = 'none';
    },100);
    class room{
        constructor(name,pass,numPlayers,isTaken){
            this.name = null,
            this.pass = null,
            this.numPlayers = 0,
            this.isTaken = false
        }
    }
    let rooms = [];

    document.getElementById('create').addEventListener('click',()=>{
        let count = 0;
        rooms.forEach(function(room){
            if(room.name == document.getElementById('createRoomName')){                 //NOT WORKING ABHI TOH
                count = 1;
                alert('Room name already taken.','Please choose another room name.');
            }
        });
        if(document.getElementById('createRoomPass').value != "" && document.getElementById('createRoomName').value != "" && count==0 && getCookie('isInRoom') == 0){
            let name2 = document.getElementById('createRoomName').value;
            let pass2 = document.getElementById('createRoomPass').value;
            let newRoom = new room(name2,pass2,1,true);
            rooms.push(newRoom);
            
            setCookie("roomName",name2);
            setCookie("roomPass",pass2);
            setCookie("isInRoom",1);
            window.location.href = "/game";
        }
        else if(getCookie('isInRoom') == 1){
            alert("You're already in a room. Please join the current room and leave it first.");
        }
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

