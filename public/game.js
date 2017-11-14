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
    socket.emit('requestStock');
}

Client.prototype.addToDiscard = function(card)
{
    card.sprite.setPosition(340, 160);
    this.discard.push(card);
    socket.emit('addedToDiscard', card); //Tell the other client the discard pile has changed, telling it which card has been added.
}
Client.prototype.removeFromDiscard = function(card)
{
    this.addToHand(card);
    util.removeCardFromArray(card, this.discard);

    socket.emit('removedFromDiscard', card); //Tell the other client the discard pile has changed, telling it which card has been removed.
}

Client.prototype.addToHand = function(card)
{
    this.hand.push(card);
    socket.emit('handChanged', this.hand.length);
}

//Should be called on the client, and then trigger an event for the server to update the number of cards this client has for the other client.
Client.prototype.removeFromHand = function(card)
{
    util.removeCardFromArray(card, this.hand); //Remove card from hand array.
    this.addToDiscard(card); //Add the card to the discard array.
    this.takeFromStock(); //Remove a card from the stock pile and add it to hand. This will trigger a hand changed event.
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

//Object References
var client = new Client();
var util = new Util();

socket.on('stockIndexReturned', function(cardId)
{
    /*When the id matching the card from the top of the shuffled stock is returned. It will loop
    through the stock of card objects on this client and will find the matching card. Once found,
    it will add that card to this clients hand, and remove it from the stock on this client.
    
    Right now, the card will still exist on the other clients unshuffled stock, it won't effect the game as
    both clients request a card from the id array on the server which does change everytime a card is taken
    and so a matching id will never show up twice.*/
    for (var i = 0; i < client.stock.length; i++)
        {
            if (client.stock[i].id === cardId)
                {
                    client.hand.push(client.stock[i]);
                    client.stock.splice(i, 1);
                    i = client.stock.length;
                }
        }

    console.log(client.hand);
});


function Card(number, suit)
{
    this.number = number;
    this.suit = suit;
    this.id;
    this.sprite;

    this.setup = function()
    {
        this.id = this.suit.toString() + this.number.toString(); //EG. suit = 2, number = 11. id = 211

        switch(this.suit)
        {
            case 0:
                this.suit = "clubs";
                this.sprite = new Sprite("cards/clubs/" + this.number + ".png");
                break;
            case 1:
                this.suit = "diamonds";
                this.sprite = new Sprite("cards/diamonds/" + this.number + ".png");
                break;
            case 2:
                this.suit = "hearts";
                this.sprite = new Sprite("cards/hearts/" + this.number + ".png");
                break;
            case 3:
                this.suit = "spades";
                this.sprite = new Sprite("cards/spades/" + this.number + ".png");
                break;   
        }
    }

    this.setup();
    
    
}


//When the other clients hand is changed, store the number of cards it has.
socket.on('handChanged', function(data)
{
    client.otherClientData.numberOfCards = data;
});



//Call code that happens once on game start here.
function start()
{
    util.initialiseStock();
}

var cardBack = new Sprite("cards/back.png", 480, 160);
//Call render code in here.
function render()
{
        renderWindow.draw(client.discard[0].sprite);

        renderWindow.draw(cardBack);
}

//Call game code in here.
function update(timeElapsed)
{

}





