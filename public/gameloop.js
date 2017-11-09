
start();

//Game Loop
var previous; 
function game_loop(timestamp)
{
	/*If there is no previous time, start with no elapsed time.*/
	if (!previous) previous = timestamp;

	var timeElapsed = (timestamp - previous) / 1000;  //Work out the elapsed time.
	  
  	update(timeElapsed); //Update the game based on elapsed time.
      
    render();	//Renders the game.
    
	
  	previous = timestamp;  //set the previous timestamp ready for next time
  	requestAnimationFrame(game_loop); //Recursively calls the game loop every animation frame when the browser is ready.
}

game_loop();