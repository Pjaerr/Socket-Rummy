function RenderWindow(width, height, bgColour)
{
    var canvas = document.getElementById("canvas");
    this.context = canvas.getContext("2d");

    //Draws a sprite at its given position.
    this.draw = function(sprite)
    {
        this.context.drawImage(sprite.img, sprite.x, sprite.y, sprite.imageData.width, sprite.imageData.height);
    }

    this.resize = function(width, height)
    {
        canvas.width = width;
        canvas.height = height;
    }

    this.setBackgroundColour = function(colour)
    {
        canvas.style.background = colour;
    }

    this.resize(width, height);
    this.setBackgroundColour(bgColour);
}