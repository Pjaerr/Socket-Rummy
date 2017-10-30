var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log("Server Running on port *3000");

var socket = require('socket.io');
var io = socket(server);

//Code to be called when a connection is made.
io.sockets.on('connection', function(socket)
{
  //Prints the new connections socket id.
  console.log('New Connection: ' + socket.id);

  //Adds a network event listener, listening for a socket.emit('mouseMoved') event.
  socket.on('mouseMoved', function(data)
  {
    //When said event occurs, send the data received from that event to all other clients.
    socket.broadcast.emit('mouseMoved', data);
  });

});

