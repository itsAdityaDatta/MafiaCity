let socket = io();

document.addEventListener("DOMContentLoaded", function(event) {  
    checkCookie();

    document.fonts.ready.then(function () {
        document.getElementById('overlay').style.display = 'none';
    });

    let form = document.getElementById("globalForm");
    form.addEventListener('submit', handleForm);
    function handleForm(event){ 

        event.preventDefault(); 
        let msg = document.getElementById('globalInp').value;

        var node = document.createElement("li");
        var textnode = document.createTextNode(getCookie('playerName') + ": " + msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);

        socket.emit('global chat message', msg, getCookie('playerName'));
        document.getElementById('globalInp').value = '';

        return false;
    }

    socket.on('global chat message2',function(msg, playerName){
        var node = document.createElement("li");
        var textnode = document.createTextNode(playerName + ": " + msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });


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

    
    document.getElementById('join').addEventListener('click',()=>{
        if(document.getElementById('joinRoomPass').value != "" && document.getElementById('joinRoomName').value != "" && getCookie('isInRoom') == 0){ 
            let name1 = document.getElementById('joinRoomName').value;
            let pass1 = document.getElementById('joinRoomPass').value;
            socket.emit('joinRoom',name1,pass1);
        }

        else if(getCookie('isInRoom') == 1){
            alert("You're already in a room.\nPlease join the current room and leave it first.");
        }
    });

    socket.on('roomNotExists2',(rName)=>{
        alert('A room by the name of ' + rName + ' does not exist.\nPlease select a different room name or create a room.');
    });

    socket.on('wrongPass',(rName,rPass)=>{
        alert('The password you have entered: ' + rPass + ' is incorrect.\nRoom name: ' + rName);
    });

    socket.on('roomExists',(rName,rPass)=>{
        setCookie("roomName",rName);
        setCookie("roomPass",rPass);
        setCookie("isInRoom",1);
        socket.emit('joinsRoom',rName,rPass,getCookie('playerName'));
        window.location.href = "/game";
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

//_______________________________________________________________THEME SWITCH_________________________________________________________________

const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  
    if (currentTheme === 'light') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    else {        
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }    
}

toggleSwitch.addEventListener('change', switchTheme, false);