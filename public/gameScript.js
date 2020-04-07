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
        else if(msg[0] == '*'){
            socket.emit('agentMsg',msg.substr(1),getCookie('roomName'),getCookie('playerName'));
            document.getElementById('inp1').value = '';
        }
        else if(msg.startsWith('/vote') || msg.startsWith('/VOTE')){
            let voteKisko = parseInt(msg.substr(5));
            socket.emit('someoneVoted',msg,voteKisko,getCookie('roomName'),getCookie('playerName'));
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

    socket.on('refreshPlayersArray',(players)=>{                                
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
            window.scrollTo(0, document.body.scrollHeight);                                                        
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

    let timeInMinutes = 1;
    socket.on('gameSetUp',(adminName)=>{
        var node = document.createElement("li");
        node.setAttribute("id",'gameMsg');
        let msg = 'Game: The game has started, there are two undercover agents among the gang. Use /vote <id> to cast your votes. You have ' + timeInMinutes + ' minutes to cast your first vote.';      
        var textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);

        voteStart(adminName);
    });

    socket.on('refreshPlayersArrayGame',(players)=>{
        document.getElementById('members').innerHTML = "";
        let id = 0;
        players.forEach((player)=>{
            var node = document.createElement("li");
            if(player.isPlaying == 1){
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
            }    
            
            var msg  = id + " " + player.name + " " +  player.isDead + " " + player.isAdmin + " " + player.isAgent + " " + player.score + " " + player.canVote + " " + player.numVotes + " " + player.isPlaying;
            var textnode = document.createTextNode(msg);
            node.appendChild(textnode);
            document.getElementById("members").appendChild(node);
            id++;
        });
    });


    socket.on('notAnAgent',()=>{
        var node = document.createElement("li");
        node.setAttribute('id','errorMsg');
        var textnode = document.createTextNode('ERROR: You must be an agent to use the * chat.');
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    }); 


    socket.on('agentMsg2',(agentOne,agentTwo,msg,playerName)=>{
        if(getCookie('playerName') == agentOne || getCookie('playerName') == agentTwo){
            var node = document.createElement("li");
            node.setAttribute('id','agentMsg');
            var textnode = document.createTextNode(playerName + ": " + msg);
            node.appendChild(textnode);
            document.getElementById("messages").appendChild(node);
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    let voteInterval = null;
    function voteStart(adminName){
        let timeInSeconds = timeInMinutes*60;                  
        voteInterval = setInterval(()=>{
            document.getElementById('startTimer').style.display = 'inline-block';
            document.getElementById('startTimer').innerHTML = timeConvert(timeInSeconds);
            if(timeInSeconds == 0){
                clearInterval(voteInterval);

                var node = document.createElement("li");
                node.setAttribute('id','agentMsg');
                var textnode = document.createTextNode('Game: The time to vote has expired.');
                node.appendChild(textnode);
                document.getElementById("messages").appendChild(node);
                window.scrollTo(0, document.body.scrollHeight);
                if(getCookie('playerName') == adminName){
                    socket.emit('timeExpired',getCookie('roomName'));
                }
            }
            timeInSeconds--;
        },1000);

    }


    function timeConvert(n) {
        let num = n;
        let minutes = (num / 60);
        let rminutes = Math.floor(minutes);
        let seconds = (minutes - rminutes) * 60;
        let rseconds = Math.round(seconds);
        return rminutes + " : " + rseconds;
    }

    socket.on('invalidID',()=>{
        var node = document.createElement("li");
        node.setAttribute('id','errorMsg');
        var textnode = document.createTextNode('ERROR: Invalid ID. Please enter a correct ID to vote out.');
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('youreDead',()=>{
        var node = document.createElement("li");
        node.setAttribute('id','errorMsg');
        var textnode = document.createTextNode('ERROR: You are dead and hence not allowed to vote.');
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    
    socket.on('cantVote',()=>{
        var node = document.createElement("li");
        node.setAttribute('id','errorMsg');
        var textnode = document.createTextNode('ERROR: You have already voted.');
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('alreadyDead',()=>{
        var node = document.createElement("li");
        node.setAttribute('id','errorMsg');
        var textnode = document.createTextNode("ERROR: The person you're voting for is already dead. Please vote another person out.");
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('notPlaying',()=>{
        var node = document.createElement("li");
        node.setAttribute('id','errorMsg');
        var textnode = document.createTextNode("ERROR: The person you're voting for is not in the game. Please vote another person out.");
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('aPlayerVoted',(kisko,kisne)=>{
        var node = document.createElement("li");
        node.setAttribute('id','gameMsg');
        var textnode = document.createTextNode("Game: " + kisne + " voted against " + kisko);
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('allPlayersHaveVoted',(players)=>{
        var node = document.createElement("li");
        node.setAttribute('id','agentMsg');
        var textnode = document.createTextNode("Game: All players have voted.");
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);

        clearInterval(voteInterval);
    });

    socket.on('playerEliminated',(player,maxNumVotes)=>{
        let node = document.createElement("li");
        node.setAttribute('id','errorMsg');
        if(player.isAgent == 1){
            let textnode = document.createTextNode("Game: " + player.name + " was voted out with "+ player.numVotes + " votes. He was an undercover agent." );
            node.appendChild(textnode);
            document.getElementById("messages").appendChild(node);
            window.scrollTo(0, document.body.scrollHeight);
        }
        else{
            let textnode = document.createTextNode("Game: " + player.name + " was voted out with " + player.numVotes+ " votes. He was a gang member." );
            node.appendChild(textnode);
            document.getElementById("messages").appendChild(node);
            window.scrollTo(0, document.body.scrollHeight);
        }
        clearInterval(voteInterval);   
    });

    let gameStartInterval = null;
    socket.on('agentsWon',(pName)=>{
        let node = document.createElement("li");
        node.setAttribute('id','agentMsg');
        let textnode = document.createTextNode("Game: The agents have Won the game. The mafia gang has been destroyed." );
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);

        let timeBeforeAnotherGame = 5;
        SetGlobals();
        InitializeConfetti();

        clearInterval(voteInterval);
        document.getElementById('startTimer').innerHTML = timeBeforeAnotherGame;

        gameStartInterval = setInterval(()=>{
            document.getElementById('startTimer').innerHTML = timeBeforeAnotherGame;
            if(timeBeforeAnotherGame == 0){
                DeactivateConfetti();
                
                clearInterval(gameStartInterval);
                document.getElementById('startTimer').style.display = "none";
                if(getCookie('playerName') == pName){
                    socket.emit('endGame',getCookie('roomName'));
                }
            }
            timeBeforeAnotherGame--;
        },1000);

    });

    socket.on('agentsLost',(pName)=>{
        let node = document.createElement("li");
        node.setAttribute('id','agentMsg');
        let textnode = document.createTextNode("Game: The agents have Lost the game. Both of the undercover agents were identified and killed." );
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
        window.scrollTo(0, document.body.scrollHeight);

        let timeBeforeAnotherGame = 5;
        SetGlobals();
        InitializeConfetti();

        clearInterval(voteInterval);
        document.getElementById('startTimer').innerHTML = timeBeforeAnotherGame;

        gameStartInterval = setInterval(()=>{
            clearInterval(voteInterval);
            document.getElementById('startTimer').innerHTML = timeBeforeAnotherGame;
            if(timeBeforeAnotherGame == 0){
                DeactivateConfetti()

                clearInterval(gameStartInterval);
                document.getElementById('startTimer').style.display = "none";
                if(getCookie('playerName') == pName){
                    socket.emit('endGame',getCookie('roomName'));
                }
            }
            timeBeforeAnotherGame--;
        },1000);    
    });

    socket.on('continue',(adminName)=>{
        voteStart(adminName);
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



//___________________________________________________________CONFETTI______________________________________________________________________

    // globals
    var canvas;
    var ctx;
    var W;
    var H;
    var mp = 150; //max particles
    var particles = [];
    var angle = 0;
    var tiltAngle = 0;
    var confettiActive = true;
    var animationComplete = true;
    var deactivationTimerHandler;
    var reactivationTimerHandler;
    var animationHandler;

    var particleColors = {
        colorOptions: ["DodgerBlue", "OliveDrab", "Gold", "pink", "SlateBlue", "lightblue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"],
        colorIndex: 0,
        colorIncrementer: 0,
        colorThreshold: 10,
        getColor: function () {
            if (this.colorIncrementer >= 10) {
                this.colorIncrementer = 0;
                this.colorIndex++;
                if (this.colorIndex >= this.colorOptions.length) {
                    this.colorIndex = 0;
                }
            }
            this.colorIncrementer++;
            return this.colorOptions[this.colorIndex];
        }
    }

    function confettiParticle(color) {
        this.x = Math.random() * W; // x-coordinate
        this.y = (Math.random() * H) - H; //y-coordinate
        this.r = RandomFromTo(10, 30); //radius;
        this.d = (Math.random() * mp) + 10; //density;
        this.color = color;
        this.tilt = Math.floor(Math.random() * 10) - 10;
        this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
        this.tiltAngle = 0;

        this.draw = function () {
            ctx.beginPath();
            ctx.lineWidth = this.r / 2;
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
            ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
            return ctx.stroke();
        }
    }

    function SetGlobals() {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }

    function InitializeConfetti() {
        particles = [];
        animationComplete = false;
        for (var i = 0; i < mp; i++) {
            var particleColor = particleColors.getColor();
            particles.push(new confettiParticle(particleColor));
        }
        StartConfetti();
    }

    function Draw() {
        ctx.clearRect(0, 0, W, H);
        var results = [];
        for (var i = 0; i < mp; i++) {
            (function (j) {
                results.push(particles[j].draw());
            })(i);
        }
        Update();

        return results;
    }

    function RandomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }


    function Update() {
        var remainingFlakes = 0;
        var particle;
        angle += 0.01;
        tiltAngle += 0.1;

        for (var i = 0; i < mp; i++) {
            particle = particles[i];
            if (animationComplete) return;

            if (!confettiActive && particle.y < -15) {
                particle.y = H + 100;
                continue;
            }

            stepParticle(particle, i);

            if (particle.y <= H) {
                remainingFlakes++;
            }
            CheckForReposition(particle, i);
        }

        if (remainingFlakes === 0) {
            StopConfetti();
        }
    }

    function CheckForReposition(particle, index) {
        if ((particle.x > W + 20 || particle.x < -20 || particle.y > H) && confettiActive) {
            if (index % 5 > 0 || index % 2 == 0) //66.67% of the flakes
            {
                repositionParticle(particle, Math.random() * W, -10, Math.floor(Math.random() * 10) - 20);
            } else {
                if (Math.sin(angle) > 0) {
                    //Enter from the left
                    repositionParticle(particle, -20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
                } else {
                    //Enter from the right
                    repositionParticle(particle, W + 20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
                }
            }
        }
    }
    function stepParticle(particle, particleIndex) {
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(angle + particle.d) + 3 + particle.r / 2) / 2;
        particle.x += Math.sin(angle);
        particle.tilt = (Math.sin(particle.tiltAngle - (particleIndex / 3))) * 15;
    }

    function repositionParticle(particle, xCoordinate, yCoordinate, tilt) {
        particle.x = xCoordinate;
        particle.y = yCoordinate;
        particle.tilt = tilt;
    }

    function StartConfetti() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        (function animloop() {
            if (animationComplete) return null;
            animationHandler = requestAnimFrame(animloop);
            return Draw();
        })();
    }

    function ClearTimers() {
        clearTimeout(reactivationTimerHandler);
        clearTimeout(animationHandler);
    }

    function DeactivateConfetti() {
        confettiActive = false;
        ClearTimers();
    }

    function StopConfetti() {
        animationComplete = true;
        if (ctx == undefined) return;
        ctx.clearRect(0, 0, W, H);
    }

    function RestartConfetti() {
        ClearTimers();
        StopConfetti();
        reactivationTimerHandler = setTimeout(function () {
            confettiActive = true;
            animationComplete = false;
            InitializeConfetti();
        }, 100);

    }

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame || 
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
