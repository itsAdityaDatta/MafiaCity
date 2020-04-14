const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const socketio = require('socket.io');

let rooms = [];
let maxPlayers = 6;

function room(name,pass){
    this.name = name;
    this.pass = pass;
    this.agentsCaught = 0;
    this.numVotes = 0;
    this.numPlayersAlive = maxPlayers;
    this.agentOne = "";
    this.agentTwo = "";
    this.players = [];
}

let port = process.env.PORT;                            // Heroku
if(port == null || port == ""){
    port = 3000;
}
const app = express();
const expressServer = app.listen(port, function(){
    console.log('listening on port', port);
});

const io = socketio(expressServer);

app.use(bodyParser.urlencoded({extended:true}));        // bodyParser
app.use(express.static('public'));                      // express.static
app.set('view engine','ejs');                           // ejs

app.get("/game",function(req,res){
    res.render('game');
});

app.get("/",function(req,res){
    res.render('home',{
    });
});

io.on('connection', (socket)=>{

    socket.on('newPlayerConnected',(pName)=>{
        io.emit('newPlayerConnected2',pName);
    });

    socket.on('chat message', function(msg,roomName,playerName){
        rooms.forEach((room)=>{
            if(room.name == roomName){
                room.players.forEach((player)=>{
                    if(player.name == playerName){
                        socket.broadcast.to(roomName).emit('chat message2', msg, playerName,player.color);
                    }
                });
            }
        })
    }); 
    
    socket.on('global chat message',function(msg,playerName){
        socket.broadcast.emit('global chat message2',msg,playerName);
    });

    socket.on('disconnecting', (reason) => {
        io.to(socket.room).emit('disconnecting2',socket.playerName);
        rooms.forEach((room)=>{
            if(room.name == socket.room){
                let k = -1;
                room.players.forEach((player)=>{
                    k++;
                    if(player.name == socket.playerName){
                        let j = k;
                        if(player.isAdmin == 1){
                            if(room.players.length!= 1){
                                io.to(room.name).emit('adminChange',room.players[1].name);
                                room.players[1].isAdmin = 1;
                            }                  
                        }
                        room.players.splice(j,1);
                        if(player.isPlaying == 0){                            
                            io.to(room.name).emit('refreshPlayersArrayGame',room.players);
                        }
                        else{
                            if(player.isDead == 1){
                                io.to(room.name).emit('refreshPlayersArrayGame',room.players);
                            }
                            else{
                                if(room.agentOne == "" && room.agentTwo == ""){
                                    io.to(room.name).emit('clearTimers');
                                    room.players.forEach((player)=>{
                                        player.isDead = 0;
                                        player.isAgent = 0;
                                        player.canVote = 1;
                                        player.numVotes = 0;
                                        player.isPlaying = 0;
                                        player.color = -1;
                                    });
                                    room.agentsCaught = 0;
                                    room.numVotes = 0;
                                    room.numPlayersAlive = maxPlayers;
                                    room.agentOne = "";
                                    room.agentTwo = "";
                                    io.to(room.name).emit('refreshPlayersArrayGame',room.players);
                                }
                                else{
                                    if(player.isAgent == 0){
                                        room.players.forEach((player)=>{
                                            if(player.isAgent == 1){
                                                player.score += 400;
                                            }
                                            player.isDead = 0;
                                            player.isAgent = 0;
                                            player.canVote = 1;
                                            player.numVotes = 0;
                                            player.isPlaying = 0;
                                            player.color = -1;
                                        });
                                        room.agentsCaught = 0;
                                        room.numVotes = 0;
                                        room.numPlayersAlive = maxPlayers;
                                        room.agentOne = "";
                                        room.agentTwo = "";
                                        io.to(room.name).emit('agentsWon2',room.players[0].name);
                                    }
    
                                    else if(player.isAgent == 1){
                                        room.players.forEach((player)=>{
                                            if(player.isAgent == 0){
                                                player.score += 200;
                                            }
                                            player.isDead = 0;
                                            player.isAgent = 0;
                                            player.canVote = 1;
                                            player.numVotes = 0;
                                            player.isPlaying = 0;
                                            player.color = -1;
                                        });
                                        room.agentsCaught = 0;
                                        room.numVotes = 0;
                                        room.numPlayersAlive = maxPlayers;
                                        room.agentOne = "";
                                        room.agentTwo = "";
                                        io.to(room.name).emit('agentsLost2',room.players[0].name);  
                                    }
                                }
                                
                            }
                        }
                    }
                });
            }
        });
        console.log(socket.playerName + ' has left the room: ' + socket.room);
        socket.emit('tab');
    });

    socket.on('createRoomJoin',(roomName,roomPass,playerName)=>{
        socket.join(roomName);
        socket.room = roomName;
        socket.playerName = playerName;
        console.log(socket.playerName + " has joined the room " + roomName);
        io.to(roomName).emit('createJoin', playerName);

        let newRoom = new room(roomName,roomPass,0,0);
        rooms.push(newRoom);

    });

    socket.on('roomJoin',(roomName,roomPass,playerName)=>{
        socket.join(roomName);
        socket.room = roomName;
        socket.playerName = playerName;
        console.log(socket.playerName + " has joined the room " + roomName);
        io.to(roomName).emit('createJoin', playerName);

        for(let i=0;i<rooms.length;i++){
            if(rooms[i].name == roomName){
                    if(rooms[i].players.length == 0){
                        rooms[i].players.push({name: playerName, isDead: 0, isAdmin: 1, isAgent: 0, score: 0, canVote : 0, numVotes : 0, isPlaying : 0, color: -1});
                    }
                    else{
                        rooms[i].players.push({name: playerName, isDead: 0, isAdmin: 0, isAgent: 0, score: 0, canVote : 0, numVotes : 0, isPlaying : 0, color: -1});
                    } 
                    io.to(rooms[i].name).emit('refreshPlayersArrayGame',rooms[i].players);
            }
        }
    });

    socket.on('createRoom',(rName,rPass)=>{
        let flag = 0;
        rooms.forEach(function(room){
            if(room.name == rName){
                socket.emit('roomAlreadyExists',rName);
                flag = 1;
            }
        });
        if(flag  == 0){
            socket.emit('roomNotExists',rName,rPass);
        }
    });


    socket.on('joinRoom',(rName,rPass,pName)=>{
        let flag = 0;
        rooms.forEach(function(room){
            if(room.name == rName){
                if(room.pass == rPass){
                    let nameCheckFlag = 0;
                    room.players.forEach((player)=>{
                        if(player.name == pName){
                            socket.emit('sameName',pName);
                            nameCheckFlag = 1;
                        }
                    });
                    if(nameCheckFlag == 0){
                        if(room.players.length < maxPlayers){
                            socket.emit('roomExists',rName,rPass);
                            if(room.players.length == maxPlayers-1){
                                io.to(rName).emit('maxPlayersJoined',room.players[0].name);
                            }
                        }
                        else{
                            socket.emit('maxPlayers',rName);
                        }
                    }
                }
                else{
                    socket.emit('wrongPass',rName,rPass);
                }
                flag = 1;
            }
        });

        if(flag  == 0){
            socket.emit('roomNotExists2',rName);
        }
    });  

    socket.on('joinsRoom',(rName,rPass,playerName)=>{
        socket.join(rName);
        console.log(playerName + " has joined the room " + rName);
    });

    socket.on('currentRoomJoin',(rName,playerName)=>{
        rooms.forEach(function(room){
            if(room.name == rName){
                let nameCheckFlag = 0;
                room.players.forEach((player)=>{
                    if(player.name == playerName){
                        socket.emit('sameName',playerName);
                        nameCheckFlag = 1;
                    }
                });
                if(nameCheckFlag == 0){
                    if(room.players.length < maxPlayers){
                        socket.emit('curRoomJoins');
                        if(room.players.length == maxPlayers-1){
                            io.to(rName).emit('maxPlayersJoined',room.players[0].name);
                        }
                    }
                    else{
                        socket.emit('maxPlayers',rName);
                    }
                }
            }
        });
    });

    socket.on('startTheGame',(rName,pName)=>{
        rooms.forEach((room)=>{
            if(room.name == rName){
                room.players.forEach((player)=>{
                    if(player.name == pName){
                        if(player.isAdmin == 1){
                            if(player.isPlaying == 0){
                                if(room.players.length == maxPlayers){
                                    
                                    room.players.forEach((player)=>{
                                        player.isPlaying = 1;
                                    });
                                    io.to(rName).emit('startTheGame',room.players);
                                }
                                else{
                                    socket.emit('notEnoughPlayers');
                                }
                            }
                            else{
                                socket.emit('gameInProgress');
                            }
                        }
                        else{
                            socket.emit('notAdmin');
                        }
                    }
                });
            }
        });
    });

    socket.on('gameStarts',(rName)=>{

        rooms.forEach((room)=>{
            if(room.name == rName){
                let numberOne = maxPlayers;                                         //Two random number generator
                let numberTwo = maxPlayers; 
                let numberThree = maxPlayers; 

                do {
                    numberOne = Math.floor(Math.random() * (maxPlayers+1));
                } while(numberOne === numberThree);
                do {
                    numberTwo = Math.floor(Math.random() * (maxPlayers+1));
                } while(numberTwo === numberThree || numberTwo === numberOne);      //Two random number generator
               
                room.players[numberOne].isAgent = 1;
                room.players[numberTwo].isAgent = 1;
                room.agentsCaught = 0;
                room.numVotes = 0;
                room.numPlayersAlive = maxPlayers;
                room.agentOne = room.players[numberOne].name;
                room.agentTwo = room.players[numberTwo].name;
                
                let color = 0;
                room.players.forEach((player)=>{
                    player.canVote = 1;
                    player.color = color;
                    color++;
                });

                io.to(rName).emit('agents',room.players[numberOne].name,room.players[numberTwo].name);
                io.to(rName).emit('gameSetUp',room.players[0].name);
                io.to(rName).emit('refreshPlayersArrayGame',room.players);
            }
        });
    });

    socket.on('agentMsg',(msg,rName,playerName)=>{
        rooms.forEach((room)=>{
            if(room.name == rName){
                room.players.forEach((player)=>{
                    if(player.name == playerName){
                        if(player.isPlaying == 1){
                            if(player.isAgent == 1){
                                io.to(rName).emit('agentMsg2',room.agentOne,room.agentTwo,msg,playerName);      
                            }
                            else{
                                socket.emit('notAnAgent');
                            }
                        }
                        else{
                            io.to(rName).emit('chat message2',msg,playerName);
                        }
                    }
                });      
            }
        });
    });

    socket.on('someoneVoted',(msg,kisko,rName,pName)=>{
        rooms.forEach((room)=>{
            if(room.name == rName){
                room.players.forEach((player)=>{
                    if(player.name == pName){
                        if(player.isPlaying == 1){
                            if(player.isDead == 0){
                                if(player.canVote == 1){
                                    if(Number.isInteger(kisko) && kisko < room.players.length){
                                        if(room.players[kisko].isPlaying == 1){
                                            if(room.players[kisko].isDead == 0){
                                                room.players[kisko].numVotes += 1;
                                                player.canVote = 0;
                                                room.numVotes += 1;
                                                io.to(rName).emit('aPlayerVoted',room.players[kisko].name,pName);
                                                if(room.numPlayersAlive == room.numVotes){
                                                    io.to(rName).emit('allPlayersHaveVoted',room.players);
                                                    allPlayersVoted(room.name);
                                                } 
                                            }
                                            else{
                                                socket.emit('alreadyDead');
                                            }
                                        }
                                        else{
                                            socket.emit('notPlaying');
                                        }          
                                    }
                                    else{
                                        socket.emit('invalidID');
                                    }
                                }
                                else{
                                    socket.emit('cantVote');
                                }
                            }
                            else{
                                socket.emit('youreDead');
                            }
                        }
                        else{
                            io.to(rName).emit('chat message2',msg,pName);
                        }
                    } 
                });
            }
        });
    });


    socket.on('timeExpired',(rName)=>{
        allPlayersVoted(rName);
    });


    function allPlayersVoted(rName){
        rooms.forEach((room)=>{
            if(room.name == rName){
                let maxNumVotes = 0;
                let maxVotedPlayers = [];
                room.players.forEach((player)=>{
                    if(player.isDead == 0 && player.isPlaying == 1){
                        if(player.numVotes > maxNumVotes){
                            maxNumVotes = player.numVotes;
                            maxVotedPlayers.splice(0,maxVotedPlayers.length);
                            maxVotedPlayers.push(player.name);
                        }
                        else if(player.numVotes == maxNumVotes){
                            maxVotedPlayers.push(player.name);
                        }
                    }
                });
                let playerNameEliminated = maxVotedPlayers[Math.floor(Math.random() * maxVotedPlayers.length)];
                console.log(maxVotedPlayers);
                console.log('max num of votes' + maxNumVotes);
                console.log(playerNameEliminated);
                room.numVotes = 0;
                room.numPlayersAlive--;
                room.players.forEach((player)=>{

                    if(player.isPlaying == 1){
                        if(player.name == playerNameEliminated){
                            player.isDead = 1;
                            player.canVote = 0;
                            if(player.isAgent == 1){
                                room.agentsCaught += 1;
                            }
                            io.to(rName).emit('playerEliminated',player);
                            io.to(rName).emit('refreshPlayersArrayGame',room.players);
                            killedPlayer(room.name);
                        }
                    }
                });
            }
        });
    }

    function killedPlayer(rName){
        rooms.forEach((room)=>{
            if(room.name == rName){
                if(room.numPlayersAlive == 2 && room.agentsCaught < 2){
                    room.players.forEach((player)=>{
                        if(player.isAgent == 1){
                            player.score += 400;
                        }
                        player.isDead = 0;
                        player.isAgent = 0;
                        player.canVote = 1;
                        player.numVotes = 0;
                        player.isPlaying = 0;
                        player.color = -1;
                    });
                    room.agentsCaught = 0;
                    room.numVotes = 0;
                    room.numPlayersAlive = maxPlayers;
                    room.agentOne = "";
                    room.agentTwo = "";
                    io.to(rName).emit('agentsWon',room.players[0].name);

                }

                else if(room.numPlayersAlive >= 2 && room.agentsCaught == 2){
                    room.players.forEach((player)=>{
                        if(player.isAgent == 0){
                            player.score += 200;
                        }
                        player.isDead = 0;
                        player.isAgent = 0;
                        player.canVote = 1;
                        player.numVotes = 0;
                        player.isPlaying = 0;
                        player.color = -1;
                    });
                    room.agentsCaught = 0;
                    room.numVotes = 0;
                    room.numPlayersAlive = maxPlayers;
                    room.agentOne = "";
                    room.agentTwo = "";
                    io.to(rName).emit('agentsLost',room.players[0].name);      

                }

                else{
                    rooms.forEach((room)=>{
                        if(room.name == rName){
                            room.players.forEach((player)=>{
                                if(player.isPlaying == 1 && player.isDead == 0){
                                    player.canVote = 1;
                                    player.numVotes = 0;
                                } 
                            });
                        }
                    });
                    io.to(rName).emit('continue',room.players[0].name);
                }
            }
        });
    }

    socket.on('endGame',(rName)=>{
        rooms.forEach((room)=>{
            if(room.name == rName){
                io.to(rName).emit('refreshPlayersArray',room.players);
            }   
        });
    });
    
});

