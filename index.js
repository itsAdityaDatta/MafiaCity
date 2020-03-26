
// io.to goes to everybody
// scoket.to goes to everyone except who is sending it

const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const socketio = require('socket.io');

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
        numUsers : numUsersConnected
    });
});

let numUsersConnected = 0;
io.on('connection', (socket)=>{
    numUsersConnected++;
  
    socket.on('chat message', function(msg,roomName,playerName){
        io.to(roomName).emit('chat message2', msg, playerName);
    });  

    socket.on('disconnecting', (reason) => {
        socket.to(socket.room).emit('disconnecting2',socket.playerName);
        console.log(socket.playerName + ' has left the room: ' + socket.room);
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
    })
});



