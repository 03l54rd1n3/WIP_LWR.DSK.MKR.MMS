'use strict';

var express = require('express');
var fs = require('fs');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var players = [];
var games = [];

class player {

    constructor() {
        this.id = 0;
        this.position = { x: 0, y: 0 };
        this.name = "UnnamedPlayer";
        this.currentLobby = 0;
        this.game = 0;
        this.score = 0;
        this.alive = true;
    }
}

class game {
    constructor() {
        this.host = undefined;
        this.name = "UnnamedGame";
        this.id = 0;
        this.socketid = undefined;
        this.lvlname = "lvl1";
        this.elements = CreateArray(32, 24);
        this.playerSpawn = { x: 0, y: 0 };
    }
}

var BlockTypes = {
    Dirt: 0,
    Gravel: 1,
    Stone: 2,
    Diamond: 3,
    Empty: 4,
    Wall: 5,
    SmallWall: 6
}

class message {
    constructor() {
        this.type = "moveplayer";
        this.data = {};
    }
}

function CreateArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = CreateArray.apply(this, args);
    }

    return arr;
}

function loadLevel(name, currentGame) {

    let readable = fs.createReadStream("level/" + name + ".txt", {
        encoding: 'utf8',
        fd: null,
    });
    readable.on('readable', function () {
        let chunk;
        let lastchunk;
        let column = 0;
        let row = 0;
        let doesCount = true;
        while (null !== (chunk = readable.read(1))) {
            if ((column < 32 && row < 24) || chunk == "\n" || chunk == "\r") {
                doesCount = true;
                switch (chunk) {
                    case "W":
                        currentGame.elements[column][row] = BlockTypes.Wall;
                        break;
                    case "w":
                        currentGame.elements[column][row] = BlockTypes.Wall;
                        break;
                    case ".":
                        currentGame.elements[column][row] = BlockTypes.Dirt;
                        break;
                    case "d":
                        currentGame.elements[column][row] = BlockTypes.Diamond;
                        break;
                    case "r":
                        currentGame.elements[column][row] = BlockTypes.Stone;
                        break;
                    case " ":
                        currentGame.elements[column][row] = BlockTypes.Empty;
                        break;
                    case "X":
                        currentGame.playerSpawn = { x: column, y: row };
                        currentGame.elements[column][row] = BlockTypes.Empty;
                        break;
                    case "\r":
                        doesCount = false;
                        if (lastchunk != "\n" && lastchunk != "\r") {
                            column = 0;
                            row++;
                        }
                        break;
                    case "\n":
                        doesCount = false;
                        if (lastchunk != "\n" && lastchunk != "\r") {
                            column = 0;
                            row++;
                        }
                        break;
                    default:
                        doesCount = false;
                        break;
                }
                if (doesCount)
                    column++;

            }
            lastchunk = chunk;
        }
    });
}


app.use(express.static("client/"));

io.on('connection', function (socket) {
    console.log('Player ' + socket.id + ' connected');
    let currentPlayer = new player();
    let currentGame = undefined;

    currentPlayer.id = players.length;
    currentPlayer.socketid = socket.id;
    players.push(currentPlayer);

    socket.on('getGames', function (data) {
        socket.emit('pushGames', games);
    });

    socket.on('joinGame', function (data) {
        currentGame = games[data];
        if (currentGame.host == undefined)
            currentGame.host = socket.id;
        currentPlayer.game = currentGame.id;
        currentPlayer.position = currentGame.playerSpawn;

        players.forEach(function (item, index) {
            if (item.game == currentGame.id)
                if (item.socketid != socket.id) {
                    socket.to(item.socketid).emit('playerJoined', currentPlayer);
                    socket.emit('playerJoined', item);
                }
        });
        console.log('Player Joined Game: ' + currentGame.name + "(" + currentPlayer.socketid + ")");

        socket.emit('gameJoined', currentGame);

        setInterval(function () {
            calculatePhysics();
        }, 1000 / 2);
    });

    socket.on('createGame', function (data) {
        currentGame = new game();
        currentGame.id = games.length;
        currentGame.name = data.name;
        currentGame.lvlname = data.lvlname;
        if (currentGame.lvlname == undefined) {
            loadLevel("lvl1", currentGame);
        }
        games.push(currentGame);
        console.log('GameCreated: ' + currentGame.name + "(" + currentGame.id + ")");
        socket.emit('gameCreated', currentGame);
    });

    socket.on('message', function (data) {
        players.forEach(function (item, index) {
            if (item.game == currentGame.id)
                if (item.socketid != socket.id) {
                    socket.to(item.socketid).emit('message', data);
                }
        });
        console.log("message:" + data);
        switch (data.type) {
            case "moveplayer":
                currentPlayer.position = data.data;
                currentGame.elements[data.data.x][data.data.y] = BlockTypes.Empty;
                break;
            case "score":
                currentPlayer.score++;
                break;
            case "die":
                currentPlayer.alive = false;
                break;
        }
    });

    socket.on('getLevel', function (data) {
        socket.emit('pushLevel', currentGame.elements)
    });

    socket.on('disconnect', function () {
        console.log('Player ' + socket.id + ' disconnected');
        let index = players.indexOf(currentPlayer);
        players.splice(index, 1);

        if (currentGame.host == socket.id)
            currentGame.host = undefined;

        let count = 0;
        players.forEach(function (player, playerindex) {
            if (currentGame.id == player.game) {
                if (currentGame.host == undefined)
                    currentGame.host = player.socketid;
                count++;
            }
        });

        games.splice(currentGame.id, 1);

        console.log(players.length + " players left playing in " + games.length + " games");

    });

    function isPlayerAtPos(position) {
        let found = false;
        players.forEach(function (player, playerindex) {
            if (currentGame.id == player.game) {
                if (player.position.x == position.x && player.position.y == position.y)
                    found = true;
            }
        });
        return found;
    }

    function getPlayerAtPos(position) {
        let found = undefined;
        players.forEach(function (player, playerindex) {
            if (currentGame.id == player.game) {
                if (player.position.x == position.x && player.position.y == position.y)
                    found = player;
            }
        });
        return found;
    }

    function calculatePhysics() {
        if (currentGame != undefined)
            if (currentGame.host == socket.id) {
                for (let x = 0; x < 32; x++)
                    for (let y = 22; y > 0; y--) {
                        let elem = currentGame.elements[x][y];

                        if (elem == BlockTypes.Stone) {
                            let next = currentGame.elements[x][y + 1];
                            if (next == BlockTypes.Empty)
                                if (!isPlayerAtPos({ x: x, y: y + 1 })) {
                                    currentGame.elements[x][y] = BlockTypes.Empty;
                                    currentGame.elements[x][y + 1] = elem;
                                    socket.emit('message', {
                                        type: 'moveblock',
                                        data: {
                                            oldPos: { x: x, y: y },
                                            newPos: { x: x, y: y + 1 }
                                        }
                                    });
                                    players.forEach(function (player, playerindex) {
                                        if (currentGame.id == player.game) {
                                            if (player.socketid != socket.id) {
                                                socket.to(player.socketid).emit('message', {
                                                    type: 'moveblock',
                                                    data: {
                                                        oldPos: { x: x, y: y },
                                                        newPos: { x: x, y: y + 1 }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                        }

                    }
            }
    }




});
http.listen(1337, function () {
    console.log('listening on *:1337');
});
