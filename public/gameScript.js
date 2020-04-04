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
        if(msg == '/start' || msg == '/START'){
           socket.emit('startTheGame',getCookie('roomName'),getCookie('playerName')); 
           document.getElementById('inp1').value = '';
        }
        else{
            var node = document.createElement("li");
            var textnode = document.createTextNode(getCookie('playerName') + ": " + msg);
            node.appendChild(textnode);
            document.getElementById("messages").appendChild(node);
            window.scrollTo(0, document.body.scrollHeight);

            socket.emit('chat message', msg, getCookie('roomName'), getCookie('playerName'));
            document.getElementById('inp1').value = '';

            return false;
        }
        
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
                node.setAttribute("id","isAdmin");
            }
            var msg  = player.name + " " +  player.isDead + " " + player.isAdmin + " " + player.isAgent + " " + player.score + " " + player.canVote + " " + player.numVotes + " " + player.isPlaying;
            var textnode = document.createTextNode(msg);
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

    socket.on('maxPlayersJoined',(adminName)=>{
        if(getCookie('playerName') == adminName){
            var node = document.createElement("li");
            node.setAttribute("id",'serverMsg');
            let msg = 'Server: Max. number of players have joined the game. Type /start to start the game.';      
            var textnode = document.createTextNode(msg);
            node.appendChild(textnode);
            document.getElementById("messages").appendChild(node);
            window.scrollTo(0, document.body.scrollHeight);                                                        // work on it
        }
    });

    window.addEventListener('unload',()=>{
        if(getCookie('tabID') == sessionStorage.getItem('tabID')){
            setCookie('tabID',-1);
        }
    });

    socket.on('notAdmin',()=>{
        var node = document.createElement("li");
        node.setAttribute("id",'errorMsg');
        let msg = 'ERROR: Only the admin can start the game.';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight); 
    });

    socket.on('notEnoughPlayers',()=>{
        var node = document.createElement("li");
        node.setAttribute("id",'errorMsg');
        let msg = 'ERROR: Insufficient number of players.';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight); 
    });

    socket.on('gameInProgress',()=>{
        var node = document.createElement("li");
        node.setAttribute("id",'errorMsg');
        let msg = 'ERROR: A game is already in progress.';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight); 
    });

// _____________________________________________________________GAME ALGORITHM_________________________________________________________________
  

    socket.on('startTheGame',(players)=>{
        var node = document.createElement("li");
        node.setAttribute("id",'errorMsg');
        let msg = 'Server: The admin ' + players[0].name + ' has started the game. The game will commence in 10 seconds.';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    
        count = 11; 
        let startInterval = setInterval(function(){
            count--;
            document.getElementById('startTimer').style.display = 'inline-block';
            document.getElementById('startTimer').innerHTML = count;
            if(count == 0){
                clearInterval(startInterval);
                if(getCookie('playerName') == players[0].name){
                    socket.emit('gameStarts',getCookie('roomName'));
                }
            }
        },1000);
    });

   socket.on('agents',(agentOne,agentTwo)=>{
       if(getCookie('playerName') == agentOne){
            var node = document.createElement("li");
            node.setAttribute("id",'gameMsg');
            let msg = 'Game: You, along with ' + agentTwo + ' are the undercover agents. Use * before your messages to deliver them to him/her only.';      
            var textnode = document.createTextNode(msg);
            node.appendChild(textnode);
            document.getElementById("messages").appendChild(node);
            window.scrollTo(0, document.body.scrollHeight);
       }
       else if(getCookie('playerName') == agentTwo){
            var node = document.createElement("li");
            node.setAttribute("id",'gameMsg');
            let msg = 'Game: You, along with ' + agentOne + ' are the undercover agents. Use * before your messages to deliver them to him/her only.';      
            var textnode = document.createTextNode(msg);
            node.appendChild(textnode);
            document.getElementById("messages").appendChild(node);
            window.scrollTo(0, document.body.scrollHeight);
        }
   });

    let timeInMinutes = 3;
    socket.on('gameSetUp',()=>{
        var node = document.createElement("li");
        node.setAttribute("id",'gameMsg');
        let msg = 'Game: The game has started, there are two undercover agents among the gang. Use /vote <id> to cast your votes. You have ' + timeInMinutes + ' minutes to cast your first vote.';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);

        //TIMER BANAAA IDHARRR
    });

    socket.on('refreshPlayersArrayGame',(players)=>{
        document.getElementById('members').innerHTML = "";
        let id = 0;
        players.forEach((player)=>{
            var node = document.createElement("li");    
            if(player.isDead == 1){
                if(player.isAgent == 1){
                    node.setAttribute('id','agentDead');
                }
                else{
                    node.setAttribute("id","isDead");    
                }
            }
            else if(player.isDead == 0){
                node.setAttribute("id",'isAlive');
            }
            var msg  = id + " " + player.name + " " +  player.isDead + " " + player.isAdmin + " " + player.isAgent + " " + player.score + " " + player.canVote + " " + player.numVotes + " " + player.isPlaying;
            var textnode = document.createTextNode(msg);
            node.appendChild(textnode);
            document.getElementById("members").appendChild(node);
            id++;
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
        if (playerName == "" || getCookie('isInRoom') == 0) {
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