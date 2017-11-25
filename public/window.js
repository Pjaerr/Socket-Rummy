function RenderWindow(width, height, bgColour)
{
    this.canvas = document.getElementById("canvas");
    this.context = canvas.getContext("2d");

    this.width = width;
    this.height = height;

    //Draws a sprite at its given position.
    this.draw = function (drawable)
    {
        if (drawable.type === "sprite")
        {
            this.context.drawImage(drawable.img, drawable.x, drawable.y, drawable.width, drawable.height);
        }
    }

    this.resize = function (width, height)
    {
        canvas.width = width;
        canvas.height = height;
        this.width = width;
        this.height = height;
    }

    this.setBackgroundColour = function (colour)
    {
        canvas.style.background = colour;
    }

    this.clearCanvas = function ()
    {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.resize(width, height);
    this.setBackgroundColour(bgColour);
}