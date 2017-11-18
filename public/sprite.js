function Sprite(path, x, y, w, h)
{
    this.type = "sprite"; //Used to indicate to the renderWindow what kind of drawable object this is.

    this.path = "resources/images/" + path;
    this.x = x || 0;
    this.y = y || 0;
    this.img;

    this.imageData = 
    {
        width: w || 96,
        height: h || 132,
    }

    this.setImage = function()
    {
        this.img = new Image(w, h);
        this.img.src = this.path;
    }  

    this.setImage();
}
Sprite.prototype.resizeImage = function(w, h)
{
    this.imageData.width = w;
    this.imageData.height = h;
}
Sprite.prototype.setPosition = function(x, y)
{
    this.x = x;
    this.y = y;
}
Sprite.prototype.translate = function(x, y)
{
    this.x += x;
    this.y += y;
}
