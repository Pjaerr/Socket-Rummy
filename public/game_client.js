//Client Code
//This is ran on all clients, and contains code for sending server events.

var renderWindow = new RenderWindow(740, 600, "#067B2C"); //Initialises the RenderWindow. Allowing RenderWindow.draw() to be called.

function Client()
{
    //Data about the other client, for now only the number of cards they have in their hand.
    this.otherClientData =
        {
            numberOfCards: 0
        };

    this.hand = []; //This client's hand.
    this.stock = []; //The stock.
    this.discard = []; //The discard pile.
    this.currentSet = []; //Holds the cards associated with the set being created.
    this.currentSetIds = []; //Holds the ids associated with the set being created.

    this.makeSetButtonIsEnabled = false;
    this.makeSetButton = new Sprite("addToSet.png", renderWindow.width * 0.65, renderWindow.height * 0.55, 30, 30);
}

//Should be called on the client, and then emitted to the server to update the stock on the other client.
Client.prototype.takeFromStock = function ()
{
    socket.emit('send_requestStock');
}

Client.prototype.takeFromDiscard = function ()
{
    socket.emit('send_removedFromDiscard', this.discard[this.discard.length - 1].id); //Tell the other client the discard pile has changed, telling it which card has been removed.
}

Client.prototype.repositionHand = function ()
{
    var count = 0;
    for (var i = 0; i < this.hand.length; i++)
    {
        if (this.hand[i] != null)
        {
            this.hand[i].grabBtn.changePath("addToSet.png");
            //Do a check here to see if card x has reached bounds, then gotta move cards down on the y and reset on the x.
            if (i < 26)
            {
                this.hand[i].setPosition((i * (renderWindow.width * 0.04)), renderWindow.height * 0.7);
            }
            else
            {

                this.hand[i].setPosition((count * (renderWindow.width * 0.04)), renderWindow.height * 0.8);
                count++;
            }
        }
    }
}

//Should be called on the client, and then trigger an event for the server to update the number of cards this client has for the other client.
Client.prototype.removeFromHand = function (card)
{
    socket.emit('send_removeFromHand', card.id);
}

Client.prototype.addCardToSet = function (card)
{
    socket.emit('send_addCardToSet', card.id);
}

Client.prototype.makeSet = function ()
{
    socket.emit('send_makeSet');
}

function Util()
{
    this.isSameNumber = function (cardId1, cardId2)
    {
        return ((cardId2.substr(1, cardId2.length)) === (cardId1.substr(1, cardId1.length)));
    }

    this.isOneHigherAndInSameSuit = function (cardId1, cardId2)
    {
        var cardNumbers =
            {
                one: parseInt(cardId1.substr(1, cardId1.length)),
                two: parseInt(cardId2.substr(1, cardId2.length))
            };

        var cardSuits =
            {
                one: cardId1.substr(0, 1),
                two: cardId2.substr(0, 1)
            };

        return ((cardSuits.one === cardSuits.two) && (cardNumbers.two === cardNumbers.one + 1));
    }

    this.removeCardFromArray = function (card, array)
    {
        for (var i = 0; i < array.length; i++)
        {
            if (card === array[i])
            {
                array.splice(i, 1);
            }
        }
    }

    this.initialiseStock = function ()
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

    this.discardBtn;
    this.grabBtn;

    this.setup = function ()
    {
        this.id = this.suit.toString() + this.number.toString(); //EG. suit = 2, number = 11. id = 211

        switch (this.suit)
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

        this.discardBtn = new Sprite("cross.png", this.sprite.x + 2, this.sprite.y - 15, 15, 15);
        this.grabBtn = new Sprite("plus.png", this.sprite.x + 14, this.sprite.y - 15, 15, 15);
    }

    this.setPosition = function (x, y)
    {
        this.sprite.setPosition(x, y);
        this.discardBtn.setPosition(x + 2, y - 15);
        this.grabBtn.setPosition(x + 14, y - 15);
    }

    this.setup();
}

