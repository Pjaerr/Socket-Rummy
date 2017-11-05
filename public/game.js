//Client Code
//This is ran on all clients, and contains code for sending and receiving server events.

//SOCKET RUMMY CLIENT CODE

var renderWindow = new RenderWindow(640, 480, "#067B2C"); //Initialises the RenderWindow. Allowing RenderWindow.draw() to be called.

function Client()
{
    //Data about the other client, for now only the number of cards they have in their hand.
    this.otherClientData = 
    {
        numberOfCards: 0
    }

    this.hand = []; //This client's hand.
    this.stock = []; //The stock.
    this.discard = []; //The discard pile.
}
//Should be called on the client, and then emitted to the server to update the stock on the other client.
Client.prototype.takeFromStock = function()
{
    //Take the top card from stock[] and add it to hand[]
    addToHand(this.stock[this.stock.length - 1]);
}

Client.prototype.addToDiscard = function(card)
{
    this.discard.push(card);
    socket.emit('addedToDiscard', card); //Tell the other client the discard pile has changed, telling it which card has been added.
}
Client.prototype.removeFromDiscard = function(card)
{
    addToHand(card);
    util.removeCardFromArray(card, this.discard);

    socket.emit('removedFromDiscard', card); //Tell the other client the discard pile has changed, telling it which card has been removed.
}

Client.prototype.addToHand = function(card)
{
    hand.push(card);
    socket.emit('handChanged', this.hand.length);
}

//Should be called on the client, and then trigger an event for the server to update the number of cards this client has for the other client.
Client.prototype.removeFromHand = function(card)
{
    util.removeCardFromArray(card, this.hand); //Remove card from hand array.
    addToDiscard(card); //Add the card to the discard array.
    takeFromStock(); //Remove a card from the stock pile and add it to hand. This will trigger a hand changed event.
}



function Util()
{
    this.removeCardFromArray = function(card, array)
    {
        for (var i = 0; i < array.length; i++)
            {
                if (card === array[i])
                {
                    array.splice(i, 1);
                }
            }
    }

    this.initialiseStock = function()
    {
        for (var i = 0; i < 4; i++) //For every suit.
        {
            for (var j = 0; j < 13; j++) //For every card in that suit.
            {
                client.stock.push(new Card(j, i)) //Create a new card of suit i and number j and add it to stock.
            }
        }
    
        //Trigger network event here that shuffles stock[] and emits it to both clients to update their version.
        //socket.emit('shuffleStock', stock.length);
    }
}


var card1 = new Card(2, 0);

document.addEventListener('mousemove', function(e)
{
    var mouseData = 
    {
        x: e.clientX,
        y: e.clientY
    }

    card1.sprite.x = mouseData.x;
    card1.sprite.y = mouseData.y;

    socket.emit('mouseMoved', mouseData);
});

socket.on('mouseMoved', function(mouseData)
{
    card1.sprite.x = mouseData.x;
    card1.sprite.y = mouseData.y;
});


//Object References
var client = new Client();
var util = new Util();


function Card(number, suit)
{
    this.number = number;
    this.suit = suit;
    this.sprite;

    this.setSuit = function()
    {
        switch(this.suit)
        {
            case 0:
                this.suit = "clubs";
                this.sprite = new Sprite("cards/clubs/" + this.number + ".png")
                break;
            case 1:
                this.suit = "diamonds";
                this.sprite = new Sprite("cards/diamonds/" + this.number + ".png")
                break;
            case 2:
                this.suit = "hearts";
                this.sprite = new Sprite("cards/hearts/" + this.number + ".png")
                break;
            case 3:
                this.suit = "spades";
                this.sprite = new Sprite("cards/spades/" + this.number + ".png")
                break;   
        }
    }
    
    this.setSuit();
}


//When the other clients hand is changed, store the number of cards it has.
socket.on('handChanged', function(data)
{
    client.otherClientData.numberOfCards = data;
});



//Call code that happens once on game start here.
function start()
{
    //util.initialiseStock();
}

//Call render code in here.
function render()
{
   /* for (var i = 0; i < client.stock.length; i++)
        {
            renderWindow.draw(client.stock[i].sprite);
        }*/

    renderWindow.draw(card1.sprite);
    
}

//Call game code in here.
function update(timeElapsed)
{

}





