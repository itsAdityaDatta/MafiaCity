let socket = io();

document.addEventListener("DOMContentLoaded", function(event) {
 
    checkCookie();

    let form = document.getElementById("form1");
    form.addEventListener('submit', handleForm);
    function handleForm(event){ 
        event.preventDefault(); 
        let msg = document.getElementById('inp1').value;
        socket.emit('chat message', msg, getCookie('roomName'), getCookie('playerName'));
        document.getElementById('inp1').value = '';
        return false;
    }
    socket.on('chat message2', function(msg,playerName){
        var node = document.createElement("li");
        var textnode = document.createTextNode(playerName + ": " + msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });
    
    socket.on('createJoin',(playerName)=>{
        var node = document.createElement("li");
        let msg = 'Server: ' + playerName+ ' has joined the room: ' + getCookie('roomName'); 
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight); 
    });

    socket.on('disconnecting2',(playerName)=>{
        var node = document.createElement("li");
        let msg = 'Server: ' + playerName + ' has left the room';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    document.getElementById('leaveRoom').addEventListener('click',()=>{
        let ans = confirm('Are you sure you want to leave the current room?');
        if(ans == true){
            setCookie('roomName',"");
            setCookie('isInRoom',0);
            window.location.href = "/"; 
        }
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
        if (playerName == "") {
            window.location.href = "/";
        }
        else{
           let roomName = getCookie('roomName');
           let roomPass = getCookie('roomPass');
           socket.emit('createRoomJoin2',roomName,roomPass,playerName);
        }
    }
});


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