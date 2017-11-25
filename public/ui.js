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

    if (takeFromStockBtn.isHighlighted())
    {
        client.takeFromStock();
    }
});