const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const socketio = require('socket.io');

let rooms = [];

function room(name,pass){
    this.name = name;
    this.pass = pass;
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
        socket.to(socket.room).emit('disconnecting2',socket.playerName);
        console.log(socket.playerName + ' has left the room: ' + socket.room);
        
        for(let i=0;i<rooms.length;i++){
            if(rooms[i].name == socket.room){
                for(let j=0;j<rooms[i].players.length;j++){
                    if(rooms[i].players[j] == socket.playerName){
                        rooms[i].players.splice(j,1);
                    }
                }
            }
        }
    });

    socket.on('createRoomJoin',(roomName,roomPass,playerName)=>{
        socket.join(roomName);
        socket.room = roomName;
        socket.playerName = playerName;
        console.log(socket.playerName + " has joined the room " + roomName);
        io.to(roomName).emit('createJoin', playerName);

        let newRoom = new room(roomName,roomPass);
        rooms.push(newRoom);

    });

    socket.on('createRoomJoin2',(roomName,roomPass,playerName)=>{
        socket.join(roomName);
        socket.room = roomName;
        socket.playerName = playerName;
        console.log(socket.playerName + " has joined the room " + roomName);
        io.to(roomName).emit('createJoin', playerName);

        for(let i=0;i<rooms.length;i++){
            if(rooms[i].name == roomName){
                    rooms[i].players.push(playerName);     //onDisconnect array se hatana bhi padega
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

    socket.on('joinRoom',(rName,rPass)=>{
        let flag = 0;
        rooms.forEach(function(room){
            if(room.name == rName){
                if(room.pass == rPass){
                    socket.emit('roomExists',rName,rPass);
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

});



