var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static(__dirname));

console.log("Server Running on port *3000");

var socket = require('socket.io');
var io = socket(server);

//Code to be called when a connection is made.
io.sockets.on('connection', function(socket)
{
  
  //Prints the new connections socket id.
  console.log('New Connection: ' + socket.id);

});


  


