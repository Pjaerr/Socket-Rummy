var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static(__dirname));

console.log("Server Running on port *3000");

var socket = require('socket.io');
var io = socket(server);


//Creates an array of ints, 0 to 51.
var cardIds = [];

for (var i = 0; i < 4; i++) //For every suit.
  {
      for (var j = 0; j < 13; j++) //For every card in that suit.
      {
        cardIds.push(i.toString() + j.toString());
      }
  }



//Code to be called when a connection is made.
io.sockets.on('connection', function(socket)
{
  
  //Prints the new connections socket id.
  console.log('New Connection: ' + socket.id);


  //Implement a similar system to the stock function but for the discard pile. Where the element is spliced, just add it to the discard pile first.
  
  socket.on('requestStock', function()
  {
    socket.emit('stockIndexReturned', cardIds[0]);
    cardIds.splice(0, 1); //Remove that element from the array.
  });

});






  


