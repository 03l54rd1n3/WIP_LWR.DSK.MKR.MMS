const {DefaultGenerator} = require('../common/generator/default');
const {ServerGameState} = require('./state');
const uuid = require('uuid/v4');

exports.SessionManager = class {

    constructor(socket) {
        this.socket = socket;
        this.generator = new DefaultGenerator({
            chances: [46, 92, 96, 100]
        });

        this.games = {};
        this.players = {};
        this.moveQueue = {};
        this.createGame('wip');
    }

    update() {
        for (let id in this.games) {
            this.games[id].update();
        }
    }

    createGame(settings = {}) {
        const {width = 32, height = 24, name = 'unnamed game'} = settings;

        const id = uuid();
        const game = new ServerGameState(this, id, width, height);
        game.name = name;

        this.generator.random(game);

        this.games[id] = game;
        this.moveQueue[id] = [];
        return id;
    }

    joinGame(client, id, nickname) {
        if (client.id in this.players) {
            client.emit('failure', 'already joined a game');
            return;
        }

        const game = this.games[id];
        if (!game) {
            client.emit('failure', 'game doesn\'t exist');
            return;
        }

        client.join(id);
        client.on('disconnect', () => {
            this.leaveGame(client);
        });

        game.addPlayer({id: client.id, nickname});

        client.emit('connected', client.id);

        this.players[client.id] = id;
    }

    leaveGame(client) {
        const id = this.players[client.id];
        if (!id) {
            client.emit('failure', 'not joined a game');
            return;
        }

        const game = this.games[id];
        if (!game) {
            client.emit('failure', 'fatal - game doesn\'t exist');
            return;
        }

        client.leave(id);
        game.removePlayer(client.id);

        client.emit('bye bye');
        client.broadcast.to(id).emit('player left');

        delete this.players[client.id];
    }

    onMove(player, action) {
        const id = this.players[player.id];
        if (!id) {
            return;
        }

        const game = this.games[id];
        if (!game) {
            return;
        }

        game.onPlayerMove({id: player.id, action});
    }

    onSyncError(player) {
        const id = this.players[player.id];
        if (!id) {
            return;
        }

        const game = this.games[id];
        if (!game) {
            return;
        }

        game.reset = true;
    }

    dispatchJoin(id, nickname) {
        this.socket.to(id).emit('player joined', nickname);
    }

    dispatchLeave(id, nickname) {
        this.socket.to(id).emit('player left', nickname);
    }

    enqueueMove(id, move) {
        const queue = this.moveQueue[id];

        if (queue) {
            queue.push(move);
        }
    }

    dispatchMoveQueue(id) {
        const queue = this.moveQueue[id];

        if (!queue || queue.length === 0) {
            return;
        }

        this.socket.to(id).emit('player moved', queue);
        this.moveQueue[id] = [];
    }

    dispatchReset(id) {
        const game = this.games[id];
        if (!game) {
            return;
        }

        const {connection, moveQueue, playerQueue, ...gamestate} = game;

        this.socket.to(id).emit('reset game', gamestate)
    }
};