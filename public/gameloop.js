var cardBacks = [];
var takeFromStockBtn = new Sprite("plus.png", (renderWindow.width * 0.864864) + 2, (renderWindow.height * 0.3) - 15, 15, 15);

//Call code that happens once on game start here.
function start()
{
	util.initialiseStock();
	cardBacks.push(new Sprite("cards/back.png", renderWindow.width * 0.864864, renderWindow.height * 0.3)); //Create the initial stock pile card back.
	socket.emit('send_gameStart');
}

//Call render code in here.
function render()
{
	if (client.makeSetButtonIsEnabled)
	{
		renderWindow.draw(client.makeSetButton);
	}

	//Draw the top card on the discard pile.
	if (client.discard[client.discard.length - 1] != null)
	{
		renderWindow.draw(client.discard[client.discard.length - 1].sprite);
		renderWindow.draw(client.discard[client.discard.length - 1].grabBtn);
	}

	//Draw this client's hand.
	for (var i = 0; i < client.hand.length; i++)
	{
		renderWindow.draw(client.hand[i].sprite);
		renderWindow.draw(client.hand[i].discardBtn);
		renderWindow.draw(client.hand[i].grabBtn);
	}

	for (var i = 0; i < client.currentSet.length; i++)
	{
		renderWindow.draw(client.currentSet[i].sprite);
		client.currentSet[i].setPosition(10 + (i * (renderWindow.width * 0.0337837837837)), renderWindow.height * 0.4);
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

start();

//Game Loop
var previous;
function game_loop(timestamp)
{
	/*If there is no previous time, start with no elapsed time.*/
	if (!previous) previous = timestamp;

	var timeElapsed = (timestamp - previous) / 1000;  //Work out the elapsed time.

	//update(timeElapsed); //Update the game based on elapsed time.


	renderWindow.clearCanvas();

	render();	//Renders the game.


	previous = timestamp;  //set the previous timestamp ready for next time
	requestAnimationFrame(game_loop); //Recursively calls the game loop every animation frame when the browser is ready.
}

game_loop();