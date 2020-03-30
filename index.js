const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const socketio = require('socket.io');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://itsAdityaDatta:Jisvsa%40706@cluster0-pzosv.mongodb.net/mafiaCityDB', {useNewUrlParser: true, useUnifiedTopology: true});

const roomSchema = new mongoose.Schema({
    name: {
      type: String
    },
    pass: {
      type : String
    },
    players: {
      type : Array
    }
});

// let rooms = [];
// function room(name,pass,players){
//     this.name = name;
//     this.pass = pass;
//     this.players = players;
// }

const mongoRooms = mongoose.model("rooms",roomSchema);

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

let numUsersConnected = 0;
io.on('connection', (socket)=>{
    numUsersConnected++;
  
    socket.on('chat message', function(msg,roomName,playerName){
        io.to(roomName).emit('chat message2', msg, playerName);
    }); 
    
    socket.on('global chat message',function(msg,playerName){
        io.emit('global chat message2',msg,playerName);
    });

    socket.on('disconnecting', (reason) => {
        socket.to(socket.room).emit('disconnecting2',socket.playerName);
        console.log(socket.playerName + ' has left the room: ' + socket.room);
        
        mongoRooms.find({}, function(err, mRooms){                              //mRooms is an array of rooms
            for(let i=0;i<mRooms.length;i++){
                if(mRooms[i].name == socket.room){
                    for(let j=0;j<mRooms[i].players.length;j++){
                        if(mRooms[i].players[j] == socket.playerName){
                            mRooms[i].players.splice(j,1);                  
                            mRooms[i].save(function(err){
                                if(err){
                                    console.log(err);
                                }
                            });
                        }
                    }
                }
            }
        });  
        
    });

    socket.on('disconnect',function(){
        numUsersConnected--;
    });

    socket.on('createRoomJoin',(roomName,roomPass,playerName)=>{
        socket.join(roomName);
        socket.room = roomName;
        socket.playerName = playerName;
        console.log(socket.playerName + " has joined the room " + roomName);
        io.to(roomName).emit('createJoin', playerName);
        
        const newRoom = new mongoRooms({
            name : roomName,
            pass : roomPass,
            players : []
        });

        newRoom.save(function(err){
            if(err){
                console.log(err);
                window.alert('An error has occured with MongoDB');
            }
        });

    });

    socket.on('createRoomJoin2',(roomName,roomPass,playerName)=>{
        socket.join(roomName);
        socket.room = roomName;
        socket.playerName = playerName;
        console.log(socket.playerName + " has joined the room " + roomName);
        io.to(roomName).emit('createJoin', playerName);

        mongoRooms.find({}, function(err, mRooms){          //mRooms is an array of rooms
            for(let i=0;i<mRooms.length;i++){
                if(mRooms[i].name == roomName){
                    mRooms[i].players.push(playerName);     //onDisconnect array se hatana bhi padega
                    mRooms[i].save(function(err){
                        if(err){
                            console.log(err);
                            window.alert('An error has occured with MongoDB');
                        }
                    });
                }
            }
        }); 
    });

    socket.on('createRoom',(rName,rPass)=>{
        mongoRooms.find({}, function(err, mRooms){          //mRooms is an array of rooms
            let flag = 0;
            mRooms.forEach(function(room){
                if(room.name == rName){
                    socket.emit('roomAlreadyExists',rName);
                    flag = 1;
                }
            });
            if(flag  == 0){
                socket.emit('roomNotExists',rName,rPass);
            }
        });  
    });

    socket.on('joinRoom',(rName,rPass)=>{
        mongoRooms.find({}, function(err, mRooms){      //mRooms is an array of rooms
            let flag = 0;
            mRooms.forEach(function(room){
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
    });

    socket.on('joinsRoom',(rName,rPass,playerName)=>{
        socket.join(rName);
        console.log(playerName + " has joined the room " + rName);
    });

});



