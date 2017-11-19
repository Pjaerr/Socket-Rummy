/**All code in here links directly with game_client.js, just split into seperate JS files for readability. 
 * This file will only contain network code that listens for events. Because sending network events is so
 * intertwined with the client code, those calls are being left in the game_client.js file.
 */

socket.on('receive_requestStock', function (cardId)
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

    socket.emit('send_handChanged', client.hand.length);
});

/**Loops through the local stock pile, and removes the id that has been added to the discard pile
 * and pushs it to this local discard pile. The change has already happened server side.
 */
socket.on('receive_addedToDiscard', function (cardId)
{
    if (client.stock.length >= 1)
    {
        for (var i = 0; i < client.stock.length; i++)
        {
            if (client.stock[i].id === cardId)
            {
                client.stock[i].setPosition(340, 160);
                client.discard.push(client.stock[i]);
                client.stock.splice(i, 1);
                i = client.stock.length;
            }
        }
    }

});

/**Loop through the local discard pile, and remove the card for the corresponding id that
 * has been removed over the network already.*/
socket.on('receive_removedFromDiscard', function (cardId)
{
    for (var i = 0; i < client.discard.length; i++)
    {
        console.log("card with id " + cardId + " removed from Discard");
        if (client.discard[i].id === cardId)
        {

            client.stock.push(client.discard[i]);
            client.discard.splice(i, 1);
            i = client.discard.length;
        }
    }
});

//When the other clients hand is changed, store the number of cards it has and update the number of card backs.
socket.on('receive_handChanged', function (data)
{
    client.otherClientData.numberOfCards = data;

    cardBacks = [];
    var count = 0;
    for (var i = 0; i < client.otherClientData.numberOfCards + 1; i++)
    {
        if (i < 25)
        {
            cardBacks.push(new Sprite("cards/back.png", (i * 20), 20));
        }
        else
        {
            cardBacks.push(new Sprite("cards/back.png", (count * 20), -40));
            count++;
        }

    }

    cardBacks[cardBacks.length - 1].setPosition(480, 160);
});

socket.on('receive_gameStart', function ()
{
    //When all objects have been initialsed both on the server and the client, take 7 cards from the stock.
    for (var i = 0; i < 7; i++)
    {
        client.takeFromStock();
    }
});

socket.on('newConnection', function ()
{
    //When a new connection has occured, tell them this client's hand size.
    socket.emit('send_handChanged', client.hand.length);
});

socket.on('receive_restartGame', function ()
{
    client.restartGame();
    socket.emit('send_gameStart');
});

socket.on('shuffledDiscardIntoStock', function ()
{
    for (var i = 0; i < client.discard.length; i++)
    {
        client.stock.push(client.discard[i]);
    }

    client.discard = [];

    socket.emit('send_stockHasBeenShuffled');
});