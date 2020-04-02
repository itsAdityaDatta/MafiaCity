let socket = io();

document.addEventListener("DOMContentLoaded", function(event) {
 
    checkCookie();

    document.fonts.ready.then(function () {
        document.getElementById('overlay').style.display = 'none';
    });

    let form = document.getElementById("form1");
    form.addEventListener('submit', handleForm);
    function handleForm(event){ 

        event.preventDefault(); 
        let msg = document.getElementById('inp1').value;
        
        var node = document.createElement("li");
        var textnode = document.createTextNode(getCookie('playerName') + ": " + msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);

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
        node.setAttribute("id",'serverMsg');
        let msg = 'Server: ' + playerName+ ' has joined the room: ' + getCookie('roomName'); 
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight); 
    });

    socket.on('disconnecting2',(playerName)=>{
        var node = document.createElement("li");
        node.setAttribute("id",'serverMsg');
        let msg = 'Server: ' + playerName + ' has left the room';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('admin',()=>{
        var node = document.createElement("li");
        node.setAttribute("id",'serverMsg');
        let msg = 'Server: You are now the admin of this room.';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('adminChange',(pName)=>{
        if(getCookie('playerName') == pName){
                var node = document.createElement("li");
                node.setAttribute("id",'serverMsg');
                let msg = 'Server: You are now the admin of this room.';      
                var textnode = document.createTextNode(msg);
                node.appendChild(textnode);
                document.getElementById("messages").appendChild(node);
                window.scrollTo(0, document.body.scrollHeight);
        }        
    });

    socket.on('refreshPlayersArray',(players)=>{                                // players array
        document.getElementById('members').innerHTML = "";
        players.forEach((player)=>{
            var node = document.createElement("li");    
            if(player.isAdmin == 1){
                node.setAttribute("id","admin");
            }
            var textnode = document.createTextNode(player.name);
            node.appendChild(textnode);
            document.getElementById("members").appendChild(node);
        });
    });

    document.getElementById('leaveRoom').addEventListener('click',()=>{
        let ans = confirm('Are you sure you want to leave the current room?');
        if(ans == true){
            setCookie('roomName',"");
            setCookie('isInRoom',0);
            window.location.href = "/"; 
        }
    });

    window.addEventListener('unload',()=>{
        if(getCookie('tabID') == sessionStorage.getItem('tabID')){
            setCookie('tabID',-1);
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
           if(getCookie('tabID') == sessionStorage.getItem('tabID')){  
                let roomName = getCookie('roomName');
                let roomPass = getCookie('roomPass');
                socket.emit('roomJoin',roomName,roomPass,playerName);
           }        
           else if(getCookie('tabID') == -1){                  
                let roomName = getCookie('roomName');
                let roomPass = getCookie('roomPass');
                socket.emit('roomJoin',roomName,roomPass,playerName);
                sessionStorage.setItem('tabID',1000*Math.random());
                setCookie('tabID',sessionStorage.getItem('tabID'));
           }

           else{
               while(1){
                    alert('A tab is already opened.\nIf it is not, please restart your browser.');
               }
           } 
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