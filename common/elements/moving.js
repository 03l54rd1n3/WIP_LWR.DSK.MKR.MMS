const {Drawable} = require('./drawable');

const settings = require('../../settings.json');
const blockSize = settings.blockSize;
const duration = settings.moveDuration;

exports.MovingBlock = class extends Drawable {

    constructor(type, posX = 0, posY = 0) {
        super(type);

        this._posX = posX;
        this._posY = posY;
        this.x = posX * settings.blockSize;
        this.y = posY * settings.blockSize;

        this.duration = 0;
        this.stepX = 0;
        this.stepY = 0;
    }

    get posX() {
        return this._posX;
    }

    set posX(x) {
        this._posX = x;

        this.duration = duration;

        this.stepX = ((x * blockSize) - this.x) / duration;
        this.stepY = ((this.posY * blockSize) - this.y) / duration;
    }

    get posY() {
        return this._posY;
    }

    set posY(y) {
        this._posY = y;

        this.duration = duration;

        this.stepX = ((this.posX * blockSize) - this.x) / duration;
        this.stepY = ((y * blockSize) - this.y) / duration;
    }

    update() {
        if (this.duration > 0) {
            this.x += this.stepX;
            this.y += this.stepY;
            this.duration--;
            return true;
        }

        if (this.duration === 0) {
            this.x = this.posX * blockSize;
            this.y = this.posY * blockSize;
        }
        return false;
    }
};