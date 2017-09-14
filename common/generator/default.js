const {MovingStone} = require('../elements/stone');
const {Block} = require('../elements/block');
const Type = require('../types');

exports.DefaultGenerator = class {

    constructor(settings) {
        this.settings = settings;
        this.types = [Type.Dirt, Type.Gravel, Type.Stone, Type.Diamond, Type.Wall, Type.PowerUp]
    }

    random(game) {
        for (let x = 0; x < game.width; x++) {
            this.randomRow(game, x);
        }
        game.playerSpawn = {x: 1, y: 1};
    }

    randomRow(game, x) {
        for (let y = 0; y < game.height; y++) {
            if (this.isBorder(game, x, y)) {
                game.setField(x, y, new Block(Type.Wall));
            } else {
                this.randomField(game, x, y);
            }
        }
    }

    isBorder(game, x, y) {
        return x === 0 || y === 0 || x === game.width - 1 || y === game.height - 1;
    }

    randomField(game, x = 0, y = 0) {
        const chance = Math.round(Math.random() * 100);

        let blockType = Type.Empty;

        for (const type of this.types) {
            if (chance <= this.settings.chances[type]) {
                blockType = type;
                break;
            }
        }

        if (blockType === Type.Stone) {
            game.fields[x * game.height + y] = new MovingStone(x, y);
        } else {
            game.setField(x, y, new Block(blockType));
        }

    }
};