const {Drawable} = require('./drawable');

const settings = require('../../settings.json');
const blockSize = settings.blockSize;

exports.Block = class extends Drawable {

    get x() {
        return this.posX * blockSize;
    }

    get y() {
        return this.posY * blockSize;
    }

    constructor(type, posX = 0, posY = 0) {
        super(type);

        this.posX = posX;
        this.posY = posY;
    }
}