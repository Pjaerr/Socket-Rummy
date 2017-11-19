
//Node Imports
var express = require('express');
var socket = require('socket.io');

//Start the Express Server on port 3000.
var app = express();
var server = app.listen(3000);

//The server will find files within the folder index.js sits.
app.use(express.static(__dirname));

console.log("Server Running on port *3000");




var io = socket(server);

//Server-side game objects

/** 
   * Both clients have a stock array containing the pack of cards, this also sits on the server in the form of an array of ids.
   * When a player takes a card from the stock pile, they essentially ask the server for the top most id. The server returns this and then
   * the client matches that id to a card in their local stock pile. They will then move that card from the stock pile into their hand and
   * the server will remove that card's id from the server side array. On the other client, the card will still exist in their local stock array
   * but they will not be able to request it as they ask an id, of which there is none on the server. The same applies for the discard pile. The 
   * discard pile exists on the server as ids and when it changes, the id that is added to the discard pile, or removed, is relayed to the clients,
   * in turn the client will move said card from either their hand or the stock array into the discard pile so that it can be drawn. 
*/


var stockCardIds = [];
var discardCardIds = [];

function setupGame()
{
  //Reset id arrays.
  stockCardIds = [];
  discardCardIds = [];

  //Creates an array of ints, 0 to 51.
  for (var i = 0; i < 4; i++) //For every suit.
  {
    for (var j = 0; j < 13; j++) //For every card in that suit.
    {
      stockCardIds.push(i.toString() + j.toString());
    }
  }

  //Creates an array of ints, storing 1 card from the stock pile at random.
  let initialDiscardCardId = Math.floor((Math.random() * 51) + 0);
  discardCardIds.push(stockCardIds[initialDiscardCardId]);
  stockCardIds.splice(initialDiscardCardId, 1);
}


/**send_ events are events coming from a client and receive_ events are
 * events coming from the server.
 */

setupGame();



//Code to be called when a connection is made.
io.sockets.on('connection', function (socket) 
{
  /**When a client disconnects, tell the other client to reset their game. Then resetup the game
   on the server side.*/
  socket.on('disconnect', function ()
  {
    io.emit('receive_restartGame');
    setupGame();
    io.emit('receive_addedToDiscard', discardCardIds[0]);
  });


  //Prints the new connection's socket id.
  console.log('New Connection: ' + socket.id);

  io.emit('newConnection');

  io.emit('receive_addedToDiscard', discardCardIds[0]);

  socket.on('send_handChanged', function (data) 
  {
    /**If a client tells the server their hand has changed, relay this to the other client, 
     * telling it the size of the other client's hand.*/
    socket.broadcast.emit('receive_handChanged', data);
  });

  socket.on('send_requestStock', function ()
  {
    /**If a client requests a card from the stock pile, send back the id 'on the top' of the 
     * stock array and then remove that id from the stock array.
    */
    socket.emit('receive_requestStock', stockCardIds[0]);
    stockCardIds.splice(0, 1);
  });

  socket.on('send_addedToDiscard', function (cardId) 
  {
    /**If a client adds a card to the discard pile, push that card's id to the discard array
     * on the server, and then emit to all clients but the sender, that the discard pile has changed.
     */
    discardCardIds.push(cardId);
    socket.broadcast.emit('receive_addedToDiscard', cardId);
  });

  socket.on('send_removedFromDiscard', function (cardId) 
  {
    /**If a client removes a card from the discard pile, loop through the discard array on the server
     * until a match for the removed id is found, when found, remove that id from the array on the server
     * and tell all other clients that a card has been removed, telling them the id so they can remove it 
     * locally.
     */
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

  //The server recieves this event when the client is ready.
  socket.on('send_gameStart', function () 
  {
    //and sends back that the server is ready.
    socket.emit('receive_gameStart');
  });
});