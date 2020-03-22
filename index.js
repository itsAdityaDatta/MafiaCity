const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(bodyParser.urlencoded({extended:true})); // bodyParser
app.use(express.static('public')); // express.static
app.set('view engine','ejs'); // ejs

let port = process.env.PORT;    // Heroku
if(port == null || port == ""){
    port = 3000;
}

io.on('connection', (socket)=>{
    console.log('a user connected');
    socket.emit('msgFromServer', instructions);
    socket.on('disconnect',function(){
        console.log('a user disconnected');
    });
    socket.on('chat message', function(msg){
        io.emit('chat message2', msg);
    });
});

http.listen(port, function(){
    console.log('listening on port', port);
});

app.get("/",function(req,res){
    res.render('home');
});

let instructions = "Server: Welcome to Mafia City."