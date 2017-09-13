const settings = require('../../settings.json');
const blockSize = settings.blockSize;

exports.Drawable = class {

    get width() {
        return blockSize;
    }

    get height() {
        return blockSize;
    }

    set type(type) {
        this._type = type;

        if (global.texture) {
            this.texture = global.texture(type);
        }
    }

    get type() {
        return this._type;
    }

    constructor(type) {
        this.type = type;
    }
};