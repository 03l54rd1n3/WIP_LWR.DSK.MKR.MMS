const {SessionManager} = require('./session-manager');

const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);
const update = io.of('/updates');

const sessions = new SessionManager(update);

io.on('connection', function (socket) {
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('chat message', function (msg) {
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('create lobby', function (settings) {
        sessions.createGame(settings);
        dispatchLobbies();
    });
});

update.on('connection', socket => {
    socket.on('join game', ({id, nickname}) => sessions.joinGame(socket, id, nickname));
    socket.on('leave game', () => sessions.leaveGame(socket));

    socket.on('out of sync', () => sessions.onSyncError(socket));
    socket.on('player move', (move) => {
        sessions.onMove(socket, move);
        console.log(move);
    });
});

function dispatchLobbies() {
    let lobbies = [];

    for(const g in sessions.games) {
        const {id, name = 'unnamed'} = sessions.games[g];

        lobbies.push({id, name});
    }

    io.emit('sessions', lobbies);
}

setInterval(() => {
    sessions.update();
}, 1000 / 60);

app.use(express.static(__dirname + '/../public'));
app.use('/dist', express.static(__dirname + '/../dist'));

const port = process.env.PORT || 1337;
server.listen(port, function () {
    console.log('listening on *:' + port);
});