//Client Code
//This is ran on all clients, and contains code for sending and receiving server events.

var socket;
socket = io.connect("localhost:3000");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//Adds a local mousemove event listener.
addEventListener('mousemove', function(e)
{
    //Stores the mouse x and y inside of mouseData JS object.
    var mouseData =
    {
        posX: e.x,
        posY: e.y
    }

    //Draws a rectangle at mouse position when the mouse is moved.
    ctx.beginPath();
    ctx.rect(e.x, e.y, 10, 10);
    ctx.fillStyle = 'red';
    ctx.fill();

    //Triggers a mouseMoved network event, sending the mouseData object with it.
    socket.emit('mouseMoved', mouseData);
});

//Checks to see if a mouseMoved network event has been emitted by the server.
socket.on('mouseMoved', function(data)
{
    //If so, draws a rectangle at the data.x and data.y positons which correspond to the mouse positions created by the event.
    ctx.beginPath();
    ctx.rect(data.posX, data.posY, 10, 10);
    ctx.fillStyle = 'blue';
    ctx.fill();
});

//SOCKET RUMMY CLIENT CODE

//Should be called on the client, and then emitted to the server to update the stock on the other client.
function takeFromStock()
{
    //Take the top card from stock[] and add it to hand[]
}

//Should be called on the client, and then trigger an event for the server to update the number of cards this client has for the other client.
function removeFromHand()
{
    //Remove said card from hand[] and add it to the top of discard[]
    takeFromStock();
}

//Data about the other client, for now only the number of cards they have in their hand.
var otherClientData = 
{
    numberOfCards: 0
}

var hand = []; //This client's hand.
var stock = []; //The stock.
var discard = []; //The discard pile.

function initialiseStock()
{
    for (var i = 0; i < 4; i++) //For every suit.
    {
        for (var j = 0; j < 13; j++) //For every card in that suit.
        {
            stock.push(new Card(j, i)) //Create a new card of suit i and number j and add it to stock.
        }
    }

    //Trigger network event here that shuffles stock[] and emits it to both clients to update their version.
    socket.emit('shuffleStock', stock.length);
}

function Card(number, suit)
{
    this.number = number;
    this.suit = suit;
    this.image;

    this.setSuit = function()
    {
        switch(this.suit)
        {
            case 0:
                this.suit = "hearts";
                break;
            case 1:
                this.suit = "diamonds";
                break;
            case 2:
                this.suit = "spades";
                break;
            case 3:
                this.suit = "clubs";
                break;
        }
    }
    
    this.setSuit();
}




