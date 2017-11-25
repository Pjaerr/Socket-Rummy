function Sprite(path, x, y, w, h)
{
    this.type = "sprite"; //Used to indicate to the renderWindow what kind of drawable object this is.

    this.path = "resources/images/" + path;
    this.x = x || 0;
    this.y = y || 0;
    this.width = w || 96;
    this.height = h || 132;
    this.img;

    this.setImage = function ()
    {
        this.img = new Image(w, h);
        this.img.src = this.path;
    }

    this.setImage();
}
Sprite.prototype.resizeImage = function (w, h)
{
    this.width = w;
    this.height = h;
}
Sprite.prototype.setPosition = function (x, y)
{
    this.x = x;
    this.y = y;
}
Sprite.prototype.translate = function (x, y)
{
    this.x += x;
    this.y += y;
}
Sprite.prototype.changePath = function (newPath)
{
    this.path = "resources/images/" + newPath;
    this.img.src = this.path;
}
Sprite.prototype.isHighlighted = function ()
{
    return mouseX > this.x && mouseX < this.x + this.width && mouseY < this.y + this.height && mouseY > this.y;
}
