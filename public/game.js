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




