const {MovingBlock} = require('./moving');
const Type = require('../types');

exports.Player = class extends MovingBlock {

    constructor(id, posX = 0, posY = 0, nickname = '(no nickname)') {
        super(Type.Player, posX, posY);

        this.id = id;
        this.nickname = nickname;

        this.alive = true;
        this.isMoving = false;
        this.score = 0;
    }

    get posX() {
        return this._posX;
    }

    set posX(x) {
        super.posX = x;
        this.isMoving = true;
    }

    get posY() {
        return this._posY;
    }

    set posY(y) {
        super.posY = y;
        this.isMoving = true;
    }

    update() {
        super.update();

        if (this.duration === 0) {
            this.isMoving = false;
        }

        return true;
    }

    die() {
        this.alive = false;
        this.isMoving = true;
    }
};