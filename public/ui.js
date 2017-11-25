var mouseX;
var mouseY;

function getMousePos(canvas, evt)
{
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}
document.addEventListener('mousemove', function (e)
{
    mouseX = getMousePos(renderWindow.canvas, e).x;
    mouseY = getMousePos(renderWindow.canvas, e).y;
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
            client.addCardToSet(client.hand[i]);
        }
    }

    if (client.discard[client.discard.length - 1] != null)
    {
        if (client.discard[client.discard.length - 1].grabBtn.isHighlighted())
        {
            client.takeFromDiscard();
        }
    }

    if (client.makeSetButton.isHighlighted())
    {
        client.makeSet();
    }

    if (takeFromStockBtn.isHighlighted())
    {
        client.takeFromStock();
    }
});