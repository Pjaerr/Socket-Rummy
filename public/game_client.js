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
Client.prototype.restartGame = function ()
{
    /**Pushes all cards from hand[] and discard[] into stock[] and then
     * clears hand[] and discard[]. The corresponding id's will have been reset on the server
     * and so it is like a brand new game.*/

    for (var i = 0; i < this.hand.length; i++)
    {
        this.stock.push(this.hand[i]);
    }
    this.hand = [];

    for (var i = 0; i < this.discard.length; i++)
    {
        this.stock.push(this.discard[i]);
    }
    this.discard = [];
}

//Should be called on the client, and then emitted to the server to update the stock on the other client.
Client.prototype.takeFromStock = function ()
{
    socket.emit('send_requestStock');
}

Client.prototype.takeFromDiscard = function ()
{
    this.addToHand(this.discard[this.discard.length - 1]);
    socket.emit('send_removedFromDiscard', this.discard[this.discard.length - 1].id); //Tell the other client the discard pile has changed, telling it which card has been removed.
    util.removeCardFromArray(this.discard[this.discard.length - 1], this.discard);
}

Client.prototype.addToHand = function (card)
{
    this.hand.push(card);
    socket.emit('send_handChanged', this.hand.length);
}

//Should be called on the client, and then trigger an event for the server to update the number of cards this client has for the other client.
Client.prototype.removeFromHand = function (card)
{
    util.removeCardFromArray(card, this.hand); //Remove card from hand array.

    card.setPosition(320, 140);
    this.discard.push(card);
    socket.emit('send_addedToDiscard', card.id); //Tell the other client the discard pile has changed, telling it which card has been added.

    this.takeFromStock(); //Remove a card from the stock pile and add it to hand. This will trigger a hand changed event.
}

function Util()
{
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

        this.discardBtn = new Button(this.sprite.x + 2, this.sprite.y - 10, 8, 8, "red");
        this.grabBtn = new Button(this.sprite.x + 12, this.sprite.y - 10, 8, 8, "blue");
    }

    this.setPosition = function (x, y)
    {
        this.sprite.setPosition(x, y);
        this.discardBtn.setPosition(x + 2, y - 10);
        this.grabBtn.setPosition(x + 12, y - 10);
    }

    this.setup();
}


var cardBacks = [];
var takeFromStockBtn = new Button(492, 150, 8, 8, "blue");


//Call code that happens once on game start here.
function start()
{
    util.initialiseStock();
    cardBacks.push(new Sprite("cards/back.png", 480, 140)); //Create the initial stock pile card back.
    socket.emit('send_gameStart');
}



//Call render code in here.
function render()
{
    //Draw the top card on the discard pile.
    if (client.discard[client.discard.length - 1] != null)
    {
        renderWindow.draw(client.discard[client.discard.length - 1].sprite);
        renderWindow.draw(client.discard[client.discard.length - 1].grabBtn);
    }

    var count = 0;
    //Draw this client's hand.
    for (var i = 0; i < client.hand.length; i++)
    {
        if (client.hand[i] != null)
        {
            //Do a check here to see if card x has reached bounds, then gotta move cards down on the y and reset on the x.
            if (i < 24)
            {
                client.hand[i].setPosition((i * 25), 300);
            }
            else
            {

                client.hand[i].setPosition((count * 25), 360);
                count++;
            }

            renderWindow.draw(client.hand[i].sprite);
            renderWindow.draw(client.hand[i].discardBtn);
            renderWindow.draw(client.hand[i].grabBtn);
        }

    }

    //Draw all of the card backs in the game.
    for (var i = 0; i < cardBacks.length; i++)
    {
        if (cardBacks[i] != null)
        {
            renderWindow.draw(cardBacks[i]);
        }
    }

    renderWindow.draw(takeFromStockBtn);
}

var boundingRect = canvas.getBoundingClientRect();
var mouseX;
var mouseY;

document.addEventListener('mousemove', function (e)
{
    mouseX = e.clientX - boundingRect.left;
    mouseY = e.clientY - boundingRect.top;
});

document.addEventListener('click', function ()
{
    for (var i = 0; i < client.hand.length; i++)
    {
        if (client.hand[i].discardBtn.isHighlighted()) //Is discard buton highlighted when clicking.
        {
            client.removeFromHand(client.hand[i]);
        }
        else if (client.hand[i].grabBtn.isHighlighted()) //Is grab buton highlighted when clicking.
        {
            console.log("Making a set using..");
        }
    }

    if (client.discard[client.discard.length - 1] != null)
    {
        if (client.discard[client.discard.length - 1].grabBtn.isHighlighted())
        {
            client.takeFromDiscard();
        }
    }

    if (takeFromStockBtn.isHighlighted())
    {
        client.takeFromStock();
    }


});


function Button(x, y, w, h, colour)
{
    this.type = "rect";

    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.fillColour = colour;

    this.isHighlighted = function ()
    {
        return mouseX > this.x && mouseX < this.x + this.width && mouseY < this.y + this.height && mouseY > this.y;
    }
    this.setPosition = function (x, y)
    {
        this.x = x;
        this.y = y;
    }
}
