const {Block} = require('../common/elements/block');
const Type = require('../common/types');
const {Player} = require('../common/elements/player');
const {GameState} = require('../common/state');

const settings = require('../settings.json');
const duration = settings.moveDuration;

exports.ServerGameState = class extends GameState {

    constructor(connection, id, width, height) {
        super(id, width, height);
        this.connection = connection;

        this.joinQueue = [];
        this.leaveQueue = [];
        this.moveQueue = [];
    }

    handleMovement() {
        let move, update = false, delayed = [];
        while (!this.reset && (move = this.moveQueue.shift())) {
            const player = this.players[move.id];

            if (!this.onMove(move.id, move.action)) {
                if (player.duration > duration) {
                    console.log('Move is not possible', move, player);
                    this.reset = true;
                    continue;
                }

                console.log('Move Delayed', player);
                delayed.push(move);
                continue;
            }


            if (player) {
                this.connection.enqueueMove(this.id, {
                    id: player.id,
                    x: player.posX,
                    y: player.posY
                });
            }

            update = true;
        }
        this.connection.dispatchMoveQueue(this.id);
        this.moveQueue = delayed;
        return update;
    }

    update() {
        this.updatePlayers();

        super.update();

        if (this.reset) {
            this.connection.dispatchReset(this.id);
            this.reset = false;
        }
    }

    updatePlayers() {
        let p;
        while (p = this.joinQueue.shift()) {
            const player = new Player(p.id, 0, 0, p.nickname);
            const {x = 0, y = 0} = this.playerSpawn || {};

            this.setField(x, y, player);
            this.players[p.id] = player;

            this.connection.dispatchJoin(this.id, p.nickname);
            this.reset = true;
        }

        while (p = this.leaveQueue.shift()) {
            const player = this.players[p];

            if (!player) {
                return;
            }

            this.connection.dispatchLeave(this.id, player.nickname);

            delete this.players[p];
            this.setField(player.posX, player.posY, new Block(Type.Empty));
            this.reset = true;
        }
    }

    addPlayer(player) {
        this.joinQueue.push(player);
    }

    removePlayer(id) {
        this.leaveQueue.push(id);
    }

    onPlayerMove(move) {
        this.moveQueue.push(move);
    }
};