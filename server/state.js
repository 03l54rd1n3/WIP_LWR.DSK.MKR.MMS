const {Block} = require('../common/elements/block');
const Type = require('../common/types');
const {Player} = require('../common/elements/player');
const {GameState} = require('../common/state');

exports.ServerGameState = class extends GameState {

    constructor(connection, id, width, height) {
        super(id, width, height);
        this.connection = connection;

        this.joinQueue = [];
        this.leaveQueue = [];
        this.moveQueue = [];
    }

    handleMovement() {
        let move, update = false;
        while (!this.reset && (move = this.moveQueue.shift())) {
            if (!this.onMove(move.id, move.action)) {
                this.reset = true;
                continue;
            }

            const player = this.players[move.id];
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
            this.setField(0, 0, player);
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