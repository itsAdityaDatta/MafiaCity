const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const socketio = require('socket.io');

let rooms = [];

function room(name,pass){
    this.name = name;
    this.pass = pass;
    this.mulesCaught = 0;
    this.numVotes = 0;
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
        socket.broadcast.to(roomName).emit('chat message2', msg, playerName);
    }); 
    
    socket.on('global chat message',function(msg,playerName){
        socket.broadcast.emit('global chat message2',msg,playerName);
    });

    socket.on('disconnecting', (reason) => {
        for(let i=0;i<rooms.length;i++){
            if(rooms[i].name == socket.room){
                for(let j=0;j<rooms[i].players.length;j++){
                    if(rooms[i].players[j].name == socket.playerName){
                        if(rooms[i].players[j].isAdmin == 1){
                            if(rooms[i].players.length!= 1){
                                io.to(rooms[i].name).emit('adminChange',rooms[i].players[1].name);
                                rooms[i].players[1].isAdmin = 1;
                            }                  
                        }
                        rooms[i].players.splice(j,1);
                    }
                }
                io.to(rooms[i].name).emit('refreshPlayersArray',rooms[i].players);
            }
        }
        io.to(socket.room).emit('disconnecting2',socket.playerName);
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
                        rooms[i].players.push({name: playerName, isDead: 0, isAdmin: 1, isAgent: 0, score: 0, canVote : 0, numVotes : 0, isPlaying : 0});
                    }
                    else{
                        rooms[i].players.push({name: playerName, isDead: 0, isAdmin: 0, isAgent: 0, score: 0, canVote : 0, numVotes : 0, isPlaying : 0});
                    } 
                    io.to(rooms[i].name).emit('refreshPlayersArray',rooms[i].players);
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


    let maxPlayers = 3;
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

                room.players.forEach((player)=>{
                    player.canVote = 1;
                    player.isPlaying = 1;
                });

                io.to(rName).emit('agents',room.players[numberOne].name,room.players[numberTwo].name);
                io.to(rName).emit('gameSetUp');
                io.to(rName).emit('refreshPlayersArrayGame',room.players);
            }
        });
    });

});



