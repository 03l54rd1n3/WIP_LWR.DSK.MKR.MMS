var elementGrid = {
    grid: CreateArray(dimensions.width, dimensions.height),

    getElementAt: function (coord) {
        if (this.isPosValid(coord)) {
            if (grid[coord.X, coord.Y] != 0 && grid[coord.X, coord.Y] != undefined && grid[coord.X, coord.Y] != null) {
                return grid[coord.X, coord.Y];
            } else {
                return 0;
            }
        } else {
            return -1;
        }
    },
    registerPosition: function (element, pos, oldPos) {
        if (this.isPosValid(pos)) {
            if (oldPos.X != -1 && oldPos.Y != -1) {
                this.grid[oldPos.X][oldPos.Y] = undefined;
            }
            console.log(pos);
            this.grid[pos.X][pos.Y] = element;
        }
    },
    isPosValid: function (coord) {
        if (coord != undefined) {

            let x = coord.X;
            let y = coord.Y;
            return (x >= 0 && x < dimensions.width && y >= 0 && y < dimensions.height);
        } else {
            return false;
        }
    }
}

var stones = [];
var dirts = [];
var gravels = [];
var diamonds = [];
var players = [];

function GameElement(blockType, posX, posY) {
    this.getGravity = function () {
        switch (this.blockType) {
            case BlockTypes.Stone:
                return 1 * gravityfactor;
            default:
                return 0;
        }
    };

    this.applyGravity = function () {
        let newY = this.pos.Y + this.getGravity();
        if (newY < dimensions.height && newY >= 0) {
            let newPos = new Coord(this.posX, newY);
            let newSpace = elementGrid.getElementAt(newPos);
            if (newSpace != 0) {
                return;
            }
            this.updatePosition(newPos);
            //TODO registrieren
        }
    };

    this.updatePosition = function (newPos) {
        let oldPos = new Coord(this.pos.X,this.pos.Y);
        this.pos = newPos;
        elementGrid.registerPosition(this, newPos, oldPos);
    };

    this.blockType = blockType;
    this.pos = new Coord(-1, -1);

    this.updatePosition(new Coord(posX, posY));

    this.texture = getTexture(this.blockType);
    this.gravity = 1;

}

function getTexture(blockType) {
    let textures = [];

    textures[BlockTypes.Dirt] = [];
    textures[BlockTypes.Dirt].push(document.getElementById('dirt'));

    textures[BlockTypes.Diamond] = [];
    textures[BlockTypes.Diamond].push(document.getElementById('diamond'));

    textures[BlockTypes.Gravel] = [];
    textures[BlockTypes.Gravel].push(document.getElementById('gravel'));

    textures[BlockTypes.Stone] = [];
    textures[BlockTypes.Stone].push(document.getElementById('stone'));

    textures = textures[blockType];

    let rand = getRandomInt(0, textures.length);
    let texture = textures[rand];
    return texture;
}