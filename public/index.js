var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static(__dirname));

console.log("Server Running on port *3000");

var socket = require('socket.io');
var io = socket(server);


//Creates an array of ints, 0 to 51.
var stockCardIds = [];

for (var i = 0; i < 4; i++) //For every suit.
  {
      for (var j = 0; j < 13; j++) //For every card in that suit.
      {
        stockCardIds.push(i.toString() + j.toString());
      }
  }

var discardCardIds = [];

var initialDiscardCard = Math.floor((Math.random() * 51) + 0);
discardCardIds.push(stockCardIds[initialDiscardCard]);
stockCardIds.splice(initialDiscardCard, 1);


//Code to be called when a connection is made.
io.sockets.on('connection', function(socket)
{
  
  //Prints the new connections socket id.
  console.log('New Connection: ' + socket.id);


  //Implement a similar system to the stock function but for the discard pile. Where the element is spliced, just add it to the discard pile first.
  
  /** 
   * Both clients have a stock array containing the pack of cards, this also sits on the server in the form of an array of ids.
   * When a player takes a card from the stock pile, they essentially ask the server for the top most id. The server returns this and then
   * the client matches that id to a card in their local stock pile. They will then move that card from the stock pile into their hand and
   * the server will remove that card's id from the server side array. On the other client, the card will still exist in their local stock array
   * but they will not be able to request it as they ask an id, of which there is none on the server. The same applies for the discard pile. The 
   * discard pile exists on the server as ids and when it changes, the id that is added to the discard pile, or removed, is relayed to the clients,
   * in turn the client will move said card from either their hand or the stock array into the discard pile so that it can be drawn. 
  */


  socket.on('send_handChanged', function(data)
  {
    socket.broadcast.emit('receive_handChanged', data);
  });

  socket.on('send_requestStock', function()
  {
    socket.emit('receive_requestStock', stockCardIds[0]);
    stockCardIds.splice(0, 1); //Remove that element from the array.
  });

  socket.on('send_addedToDiscard', function(cardId)
  {
    discardCardIds.push(cardId);
    socket.broadcast.emit('receive_addedToDiscard', cardId);
  });

  socket.on('send_removedFromDiscard', function(cardId)
  {
    for (var i = 0; i < discardCardIds.length; i++)
      {
        if (discardCardIds[i] === cardId)
          {
            discardCardIds.splice(i, 1);
            socket.broadcast.emit('receive_removedFromDiscard', cardId);
            i = discardCardIds.length;
          }
      }
  });

socket.on('send_gameStart', function()
{
  socket.emit('receive_gameStart');
});

io.emit('receive_addedToDiscard', discardCardIds[0]);
io.emit('newConnection');

});






  


