const {MovingBlock} = require('./moving');
const Type = require('../types');

const settings = require('../../settings.json');
const blockSize = settings.blockSize;

function collide(a, b) {
    return (a - b) > 0.001;
}

exports.MovingStone = class extends MovingBlock {

    constructor(posX = 0, posY = 0) {
        super(Type.Stone, posX, posY);
        this.freeze = 0;
    }

    update(players) {
        for (const id in players) {
            if (!this.collideWithPlayer(players[id])) {
                continue;
            }
            console.log('death');

            if (global.texture) {
                this.texture = global.texture('crushed');
            }
        }

        if (this.freeze-- > 0) {
            return true;
        }

        return super.update();
    }

    collideWithPlayer(player) {
        if (player.posX !== this.posX) {
            return false;
        }

        return collide(this.y + blockSize, player.y)
            && collide(player.y + blockSize, this.y);
    }

    get posX() {
        return this._posX;
    }

    set posX(x) {
        super.posX = x;
        this.freeze = 60;
    }

    get posY() {
        return this._posY;
    }

    set posY(y) {
        super.posY = y;
        this.freeze = 60;
    }
};