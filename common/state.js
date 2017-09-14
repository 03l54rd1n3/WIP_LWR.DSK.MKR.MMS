const Type = require('./types');
const {Block} = require('./elements/block');

exports.GameState = class {

    constructor(id, width, height) {
        this.id = id;
        this.width = width;
        this.height = height;

        this.fields = new Array(width * height);

        this.players = {};
        this.rollingStones = [];
        this.physicsUp = false;
    }

    getField(x, y) {
        x = x % this.width;
        y = y % this.height;
        return this.fields[x * this.height + y];
    }

    setField(x, y, field) {
        x = x % this.width;
        y = y % this.height;

        field.posX = x;
        field.posY = y;

        return this.fields[x * this.height + y] = field;
    }

    onMove(id, action) {
        const player = this.players[id];
        if (!player || player.isMoving) {
            return false;
        }

        let {posX: x, posY: y} = player;
        if (action === 'up') {
            y--;
        } else if (action === 'right') {
            x++;
        } else if (action === 'down') {
            y++;
        } else if (action === 'left') {
            x--;
        }

        if (!this.canMove(x, y)) {
            return false;
        }

        this.movePlayer(x, y, player);

        return true;
    }

    canMove(x, y) {
        if (!this.inBounds(x, y)) {
            return false;
        }

        const field = this.getField(x, y);
        if (!field) {
            return false;
        }

        return this.isConsumable(field.type);
    }

    inBounds(x, y) {
        return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
    }

    isConsumable(type) {
        switch (type) {
            case Type.Empty:
            case Type.Diamond:
            case Type.Gravel:
            case Type.Dirt:
            case Type.PowerUp:
                return true;
            default:
                return false;
        }
    }

    sideEffects(x, y, player) {
        const field = this.getField(x, y);

        if(field.type === Type.Diamond) {
            player.score++;
        } else if(field.type === Type.PowerUp) {
            this.physicsUp = !this.physicsUp;
        }
    }

    movePlayer(x, y, player) {
        this.sideEffects(x, y, player);
        this.setField(player._posX, player._posY, new Block(Type.Empty));
        this.setField(x, y, player);
    }

    moveStone(x, y, stone) {
        this.setField(stone.posX, stone.posY, new Block(Type.Empty));
        stone.posX = x;
        stone.posY = y;
        this.rollingStones.push(stone);
    }

    physics() {
        for (let x = 0; x < this.width; x++) {
            this.physicsColumn(x, this.physicsUp);
        }
    }

    physicsColumn(x, up) {
        const offset = this.height * x;
        let downForce = 0;

        let y = up ? offset : offset + this.height - 1;
        const step = up ? 1 : -1;
        const downForceStep = up ? -1 : 1;

        for (let i = 0; i < this.height; i++, y += step) {
            switch (this.fields[y].type) {
                case Type.Empty:
                case Type.Player:
                    downForce += downForceStep;
                    break;
                case Type.Stone:
                    if (downForce !== 0 && !this.fields[y].hidden) {
                        const oY = y - offset;
                        const tY = y - offset + downForce;

                        const stone = this.getField(x, oY);
                        this.moveStone(x, tY, stone);
                    }
                    break;
                default:
                    downForce = 0;
            }
        }
    }

    onPlayerDeath(id) {
        const player = this.players[id];

        if(!player) {
            return;
        }

        player.die();
        this.setField(player.posX, player.posY, new Block(Type.Empty));
    }

    earlyUpdate() {
        for (const id in this.players) {
            this.players[id].update();
        }
        return this.handleMovement();
    }

    lateUpdate() {
        let update = false;

        for (let i = 0; i < this.rollingStones.length; i++) {
            const element = this.rollingStones[i];

            if (!element.update || !element.update(this.players, this)) {
                update = true;
                this.rollingStones.splice(i, 1);
                i--;

                const {posX: x = 0, posY: y = 0} = element;
                this.fields[x * this.height + y] = element;
            }
        }

        return update;
    }

    update() {
        if (this.earlyUpdate() || this.lateUpdate()) {
            this.physics();
        }
    }
};