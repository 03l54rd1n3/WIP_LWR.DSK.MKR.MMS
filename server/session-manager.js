const {DefaultGenerator} = require('../common/generator/default');
const {ServerGameState} = require('./state');
const uuid = require('uuid/v4');
const settings = require('../settings.json');

exports.SessionManager = class {

    constructor(socket) {
        this.socket = socket;
        this.generator = new DefaultGenerator({
            chances: settings.chances
        });

        this.games = {};
        this.players = {};
        this.moveQueue = {};
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
        console.log(`Player ${client.id} is trying to join Game ${id} as '${nickname}'.`);

        if (client.id in this.players) {
            console.log('Player is still connected to a game');
            this.leaveGame(client);
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

        console.log(`Player ${client.id} joined Game ${id} as '${nickname}'.`);
    }

    leaveGame(client) {
        console.log(`Player ${client.id} is trying to leave.`);

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

        delete this.players[client.id];
        console.log(`Player ${client.id} left Game ${id}.`);
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