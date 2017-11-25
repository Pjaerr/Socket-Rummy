/**All code in here links directly with game_client.js, just split into seperate JS files for readability. 
 * This file will only contain network code that listens for events. Because sending network events is so
 * intertwined with the client code, those calls are being left in the game_client.js file.
 */

//------------------------------------------------------STOCK MANAGEMENT -------------------------------------------------------

socket.on('receive_requestStock', function (cardId)
{
    /*When the id matching the card from the top of the shuffled stock is returned. It will loop
    through the stock of card objects on this client and will find the matching card. Once found,
    it will add that card to this clients hand, and remove it from the stock on this client.

    Right now, the card will still exist on the other clients unshuffled stock, it won't effect the game as
    both clients request a card from the id array on the server which does change everytime a card is taken
    and so a matching id will never show up twice.*/
    for (let i = 0; i < client.stock.length; i++)
    {
        if (client.stock[i].id === cardId)
        {
            client.hand.push(client.stock[i]);
            client.stock.splice(i, 1);
            i = client.stock.length;
        }
    }

    client.repositionHand();

    socket.emit('send_handChanged', client.hand.length);
    socket.emit('send_endTurn');
});

//------------------------------------------------------STOCK MANAGEMENT -------------------------------------------------------


//------------------------------------------------------DISCARD MANAGEMENT -------------------------------------------------------

/**Loops through the local stock pile, and removes the id that has been added to the discard pile
 * and pushs it to this local discard pile. The change has already happened server side.
 */
socket.on('receive_addedToDiscard', function (cardId)
{
    if (client.stock.length >= 1)
    {
        for (let i = 0; i < client.stock.length; i++)
        {
            if (client.stock[i].id === cardId)
            {
                client.stock[i].setPosition(renderWindow.width * 0.7, renderWindow.height * 0.3);
                client.discard.push(client.stock[i]);
                client.stock.splice(i, 1);
                i = client.stock.length;
            }
        }
    }
});

socket.on('shuffledDiscardIntoStock', function ()
{
    for (let i = 0; i < client.discard.length; i++)
    {
        client.stock.push(client.discard[i]);
    }

    client.discard = [];

    socket.emit('send_stockHasBeenShuffled');
});

/**Add the top of the discard to this clients hand, and remove that card from the discard array. This is only called on the client
 * that actually requested the card from the discard pile.*/
socket.on('receive_takeFromDiscard', function ()
{
    client.hand.push(client.discard[client.discard.length - 1]);
    socket.emit('send_handChanged', client.hand.length);
    util.removeCardFromArray(client.discard[client.discard.length - 1], client.discard);
    client.repositionHand();
    socket.emit('send_endTurn');
});

/**Loop through the local discard pile, and remove the card for the corresponding id that
 * has been removed over the network already. This happens on the client who didn't request the removal.*/
socket.on('receive_removedFromDiscard', function (cardId)
{
    for (let i = 0; i < client.discard.length; i++)
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

//------------------------------------------------------DISCARD MANAGEMENT -------------------------------------------------------

//------------------------------------------------------TURN MANAGEMENT -------------------------------------------------------

socket.on('receive_makeMyTurn', function ()
{
    socket.emit('send_makeMyTurn');

    document.getElementById("yourTurn").innerHTML = "Your Turn!";
});
socket.on('receive_turnEnded', function ()
{
    document.getElementById("yourTurn").innerHTML = "";
});

//------------------------------------------------------TURN MANAGEMENT -------------------------------------------------------

//------------------------------------------------------HAND MANAGEMENT -------------------------------------------------------

//When the other clients hand is changed, store the number of cards it has and update the number of card backs.
socket.on('receive_handChanged', function (data)
{
    client.otherClientData.numberOfCards = data;

    cardBacks = [];
    let count = 0;
    for (let i = 0; i < client.otherClientData.numberOfCards + 1; i++)
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

    cardBacks[cardBacks.length - 1].setPosition(renderWindow.width * 0.864864, renderWindow.height * 0.3);
});

socket.on('newConnection', function ()
{
    //When a new connection has occured, tell them this client's hand size.
    socket.emit('send_handChanged', client.hand.length);
});

/**Gets called on the client who requested the removal. Basically checks to see if it is their turn via the server
 * before actually removing anything client side.*/
socket.on('receive_removeFromHand', function (cardId)
{
    for (let i = 0; i < client.hand.length; i++)
    {
        if (client.hand[i].id === cardId)
        {
            client.discard.push(client.hand[i]);
            client.hand[i].setPosition(320, 140);
            util.removeCardFromArray(client.hand[i], client.hand); //Remove card from hand array.
        }
    }

    client.repositionHand();

    socket.emit('send_addedToDiscard', cardId); //Tell the other client the discard pile has changed, telling it which card has been added.

    client.takeFromStock(); //Remove a card from the stock pile and add it to hand. This will trigger a hand changed event.
    socket.emit('send_isHandEmpty', client.hand.length);
    socket.emit('send_endTurn');
});

//------------------------------------------------------HAND MANAGEMENT -------------------------------------------------------

//------------------------------------------------------SET CREATION MANAGEMENT -------------------------------------------------------

socket.on('receive_addCardToSet', function (cardId)
{
    client.currentSetIds.push(cardId); //Adds the currently selected card to the array of ids.

    for (let i = 0; i < client.hand.length; i++)
    {
        if (client.hand[i].id === cardId)
        {
            client.currentSet.push(client.hand[i]);
            client.hand.splice(i, 1);
            i = client.hand.length;
        }
    }

    client.repositionHand();
});


socket.on('receive_makeSet', function ()
{
    let numberOfCorrectCards = 0; //Stores the number of cards that match the previous card in the 'set'
    let typeOfSet = "";


    if (util.isSameNumber(client.currentSetIds[1], client.currentSetIds[0]))
    {
        typeOfSet = "sameNumber";
    }
    else if (util.isOneHigherAndInSameSuit(client.currentSetIds[1], client.currentSetIds[0]))
    {
        typeOfSet = "sameSuit";
    }

    /**Loop through the set, and if each next card in the set is either the  */
    for (let i = 0; i < client.currentSetIds.length - 1; i++)
    {
        if (typeOfSet === "sameNumber")
        {
            if (util.isSameNumber(client.currentSetIds[i + 1], client.currentSetIds[i]))
            {
                numberOfCorrectCards++;

                if (i === client.currentSetIds.length - 2)
                {
                    numberOfCorrectCards++;
                }
            }
        }
        else if (typeOfSet === "sameSuit")
        {
            if (util.isOneHigherAndInSameSuit(client.currentSetIds[i + 1], client.currentSetIds[i]))
            {
                numberOfCorrectCards++;

                if (i === client.currentSetIds.length - 2)
                {
                    numberOfCorrectCards++;
                }
            }
        }
    }

    if (numberOfCorrectCards >= 3 && numberOfCorrectCards === client.currentSetIds.length)
    {
        socket.emit('send_setMade', client.currentSetIds); //Make set.


        console.log("SET MADE!");

        //TODO; Move the created set to an array, and then figure out where to show the all clients the actual cards.

        client.currentSet = [];
        client.currentSetIds = [];
    }
    else
    {
        //Push cards back into hand.
        client.currentSetIds = [];

        for (let i = 0; i < client.currentSet.length; i++)
        {
            client.hand.push(client.currentSet[i]);
        }

        client.currentSet = [];
    }
    //Make a set using the client.currentSet, and then clear client.currentSet, making sure to tell other client about all of this.

    client.repositionHand();
});

socket.on('receive_setMade', function (setIds)
{
    for (let i = 0; i < client.stock.length; i++)
    {
        if (setIds[i] === client.stock[i].id)
        {
            //REMOVE FROM LOCAL STOCK, AND SHOW ON SCREEN AS OTHER CLIENT'S NEW SET.
        }
    }
});

//------------------------------------------------------SET CREATION MANAGEMENT -------------------------------------------------------


//------------------------------------------------------GAME STATE MANAGEMENT -------------------------------------------------------
socket.on('receive_restartGame', function ()
{
    /**Pushes all cards from hand[] and discard[] into stock[] and then
     * clears hand[] and discard[]. The corresponding id's will have been reset on the server
     * and so it is like a brand new game.*/

    for (let i = 0; i < client.hand.length; i++)
    {
        client.stock.push(client.hand[i]);
    }
    client.hand = [];

    for (let i = 0; i < client.discard.length; i++)
    {
        client.stock.push(client.discard[i]);
    }
    client.discard = [];

    socket.emit('send_gameStart');
});

socket.on('receive_gameStart', function ()
{
    //When all objects have been initialsed both on the server and the client, take 7 cards from the stock.
    for (let i = 0; i < 7; i++)
    {
        client.takeFromStock();
    }
});

socket.on('receive_youWin', function ()
{
    console.log("You Win!");
    client.rematchButtonIsEnabled = true;
});
socket.on('receive_youLose', function ()
{
    console.log("You Lose!");
    client.rematchButtonIsEnabled = true;
});

//------------------------------------------------------GAME STATE MANAGEMENT -------------------------------------------------------