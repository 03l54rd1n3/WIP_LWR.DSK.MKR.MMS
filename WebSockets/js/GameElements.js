var elementGrid = {
    grid: CreateArray(dimensions.width, dimensions.height),

    getElementAt: function (coord) {
        if (this.isPosValid(coord)) {
            if (this.grid[coord.X][coord.Y] != 0 && this.grid[coord.X][coord.Y] != undefined && this.grid[coord.X][coord.Y] != null) {
                return this.grid[coord.X][coord.Y];
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

var lobbyCon;

var stones = [];
var dirts = [];
var gravels = [];
var diamonds = [];
var players = [];

function GameElement(blockType, posX, posY) {
    let obj = new Object();

    obj.getGravity = function () {
        switch (this.blockType) {
            case BlockTypes.Stone:
                return 1 * gravityfactor;
            default:
                return 0;
        }
    };

    obj.applyGravity = function () {
        let newY = this.pos.Y + this.getGravity();
        if (newY < dimensions.height && newY >= 0) {
            let newPos = new Coord(this.pos.X, newY);
            let playerCoord = player.getCoord();
            let newSpace = elementGrid.getElementAt(newPos);
            if (newSpace != 0) {
                return;
            }
            if (newPos.X != playerCoord.X || newPos.Y != playerCoord.Y) {
                this.updatePosition(newPos);
            }
            else if(this.willCrushPlayer) {
                //playerKilled
                console.log("Player killed by Rock.")
                this.updatePosition(newPos);
                player.onDeath();
            }
            //TODO registrieren
        }

        //could cause problems
        let farY = this.pos.Y + (this.getGravity() * 2);
        if (farY < dimensions.height && farY >= 0) {
            let newPos = new Coord(this.pos.X, farY);
            let playerCoord = player.getCoord();
            let newSpace = elementGrid.getElementAt(newPos);
            if (newSpace != 0) {
                return;
            }

            if (newPos.X == playerCoord.X && newPos.Y == playerCoord.Y) {
                console.log("WillCrushPlayer: X:" + newPos.X + " Y:" + newPos.Y + " , X:" + playerCoord.X + " Y:" + playerCoord.Y);
                this.willCrushPlayer = true;
            }


        }
    };

    obj.updatePosition = function (newPos) {
        let oldPos = new Coord(this.pos.X, this.pos.Y);
        this.pos = newPos;
        elementGrid.registerPosition(this, newPos, oldPos);

        lobbyCon.updatedPosition(oldPos, newPos);
    };

    obj.willCrushPlayer = false;

    obj.blockType = blockType;
    obj.pos = new Coord(-1, -1);

    obj.updatePosition(new Coord(posX, posY));

    obj.texture = getTexture(obj.blockType);
    obj.gravity = 1;

    return obj;

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

    textures[BlockTypes.RemotePlayer] = [];
    textures[BlockTypes.RemotePlayer].push(document.getElementById('remotecharacter'));

    textures = textures[blockType];

    let rand = getRandomInt(0, textures.length);
    let texture = textures[rand];
    return texture;
}