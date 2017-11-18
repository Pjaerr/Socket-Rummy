//Client Code
//This is ran on all clients, and contains code for sending server events.

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
    socket.emit('send_requestStock');
}

Client.prototype.takeFromDiscard = function()
{
    this.addToHand(this.discard[this.discard.length - 1]);
    util.removeCardFromArray(this.discard[this.discard.length - 1], this.discard);

    socket.emit('send_removedFromDiscard', this.discard[this.discard.length - 1].id); //Tell the other client the discard pile has changed, telling it which card has been removed.
}

Client.prototype.addToHand = function(card)
{
    this.hand.push(card);
    socket.emit('send_handChanged', this.hand.length);
}

//Should be called on the client, and then trigger an event for the server to update the number of cards this client has for the other client.
Client.prototype.removeFromHand = function(card)
{
    util.removeCardFromArray(card, this.hand); //Remove card from hand array.

    card.sprite.setPosition(340, 160);
    this.discard.push(card);
    socket.emit('send_addedToDiscard', card.id); //Tell the other client the discard pile has changed, telling it which card has been added.

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
    }
}

//Object References
var client = new Client();
var util = new Util();

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

var cardBacks = [];

//Call code that happens once on game start here.
function start()
{
    util.initialiseStock();
    cardBacks.push(new Sprite("cards/back.png", 480, 160)); //Create the initial stock pile card back.
}

//Call render code in here.
function render()
{
        //Draw the top card on the discard pile.
        if (client.discard[client.discard.length - 1] != null)
        {
            renderWindow.draw(client.discard[client.discard.length - 1].sprite);
        }

        //Draw this client's hand.
        for (var i = 0; i < client.hand.length; i++)
            {
                if (client.hand[i] != null)
                    {
                        //Do a check here to see if card x has reached bounds, then gotta move cards down on the y and reset on the x.
                        client.hand[i].sprite.setPosition((i * 20), 300); 
                        renderWindow.draw(client.hand[i].sprite);
                    }
                
            }

        //Draw all of the card backs in the game.
        for (var i  = 0; i < cardBacks.length; i++)
            {
                if (cardBacks[i] != null)
                    {
                        renderWindow.draw(cardBacks[i]);
                    }
                
            }
}

//Call game code in here.
function update(timeElapsed)
{
}
