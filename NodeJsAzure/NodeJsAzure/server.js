'use strict';

var express = require('express');
var fs = require('fs');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//Global Variables

var players = [];
var games = [];
var lobbys = [];
var levels = [];


//Classes

class player {

    constructor() {
        this.ready = false;
        this.score = 0;
        this.id = 0;
        this.position = { x: 0, y: 0 };
        this.name = "UnnamedPlayer";
        this.currentLobby = 0;
        this.game = -1;
        this.lobby = -1;
        this.score = 0;
        this.alive = true;
    }
}

class game {
    constructor() {
        this.lobby = -1;
        this.host = undefined;
        this.name = "UnnamedGame";
        this.id = 0;
        this.socketid = undefined;
        this.lvlname = "lvl1";
        this.elements = [];
        this.playerSpawn = { x: 0, y: 0 };
    }
}

class lobby {
    constructor() {
        this.name = "UnnamedLobby";
        this.id = 0;
        this.lvlname = "lvl1";
    }
}

class message {
    constructor() {
        this.type = "moveplayer";
        this.data = {};
    }
}

class level {
    constructor() {
        this.playerSpawn = { x: 0, y: 0 };
        this.name = "";
        this.elements = [];
    }
}

class element {
    constructor() {
        this.falling = 0;
        this.id = 0;
        this.type = BlockTypes.Empty;
        this.position = { x: 0, y: 0 };
        this.currentPosition = { x: 0, y: 0 };
    }
}

//BlockTypes

var BlockTypes = {
    Dirt: 0,
    Gravel: 1,
    Stone: 2,
    Diamond: 3,
    Empty: 4,
    Wall: 5,
    SmallWall: 6,
    Morningstar: 7,
    PowerUp: 8,
    Explosion: 9
}


//Global Functions

function loadLevel(name) {

    let curlevel = new level();
    curlevel.name = name;
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
                let elem = new element();
                elem.position = { x: column, y: row };
                elem.currentPosition = { x: column, y: row };
                elem.id = curlevel.elements.length;
                switch (chunk) {
                    case "W":
                        elem.type = BlockTypes.Wall;
                        break;
                    case "w":
                        elem.type = BlockTypes.SmallWall;
                        break;
                    case ".":
                        elem.type = BlockTypes.Dirt;
                        break;
                    case "m":
                        elem.type = BlockTypes.Morningstar;
                        break;
                    case "p":
                        elem.type = BlockTypes.PowerUp;
                        break;
                    case "d":
                        elem.type = BlockTypes.Diamond;
                        break;
                    case "r":
                        elem.type = BlockTypes.Stone;
                        break;
                    case " ":
                        elem.type = BlockTypes.Empty;
                        break;
                    case "X":
                        curlevel.playerSpawn = { x: column, y: row };
                        elem.type = BlockTypes.Empty;
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
                if (doesCount) {
                    column++;
                    if (elem.type != BlockTypes.Empty)
                        curlevel.elements.push(elem);
                }

            }
            lastchunk = chunk;
        }
        levels.push(curlevel);
    });
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

function lobbyExists(name) {
    let found = false;
    lobbys.forEach(function (item, index) {
        if (item.name == name)
            found = true;
    });
    return found;
}

function getLobbyByName(name) {
    let found = undefined;
    lobbys.forEach(function (item, index) {
        if (item.name == name)
            found = item;
    });
    return found;
}

function getLevelByLevelName(name) {
    let level = {};
    levels.forEach(function (item, index) {
        if (item.name = name)
            level = JSON.parse(JSON.stringify(item));
    });
    return level;
}

function removeEmptyLobbys() {
    let toSplice = [];
    lobbys.forEach(function (item, index) {
        if (item != undefined) {
            let count = 0;
            players.forEach(function (player, playerindex) {
                if (item.id == player.lobby) {
                    count++;
                }
            });
            if (count == 0)
                toSplice.push(index);
        }
    });
    toSplice.forEach(function (item, index) {
        lobbys.splice(item, 1);
    });
}


io.on('connection', function (socket) {

    //Connection Init

    console.log('Player ' + socket.id + ' connected');
    var currentPlayer = new player();
    var currentGame = undefined;
    var currentLobby = undefined;

    currentPlayer.id = players.length;
    currentPlayer.socketid = socket.id;
    players.push(currentPlayer);


    //Generic Functions

    function printGameLayout() {
        let rows = [];
        for (let x = 0; x < 32; x++) {
            let row = "";
            for (let y = 0; y < 24; y++) {
                switch (currentGame.elements[x][y]) {
                    case BlockTypes.Wall:
                        row = row + "W";
                        break;
                    case BlockTypes.Stone:
                        row = row + "r";
                        break;
                    case BlockTypes.Dirt:
                        row = row + ".";
                        break;
                    case BlockTypes.Diamond:
                        row = row + "D";
                        break;
                    case BlockTypes.Empty:
                        row = row + " ";
                        break;
                    default:
                        row = row + "0";
                        break;
                }

            }
            rows.push(row);
        }

        rows.forEach(function (item, index) {
            console.log(item);
        });
    }

    function updateLobbyPlayers() {
        let lobbyPlayers = [];
        players.forEach(function (item, index) {
            if (item.lobby == currentLobby.id) {
                lobbyPlayers.push(item);
            }
        });
        socket.emit('pushPlayers', lobbyPlayers);
    }

    function getElementById(id) {
        let elem = undefined;
        currentGame.elements.forEach(function (item, index) {
            if (item.id == id)
                elem = item;
        });
        return elem;
    }

    function getElementAtPosition(position) {
        let elem = undefined;
        currentGame.elements.forEach(function (item, index) {
            if (item.position.x == position.x && item.position.y == position.y)
                elem = item;
        });
        return elem;
    }

    //GenericEvents

    socket.on('disconnect', function () {
        console.log('Player ' + socket.id + ' disconnected');
        let index = players.indexOf(currentPlayer);
        players.splice(index, 1);
        if (currentGame != undefined) {
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
        }
        removeEmptyLobbys();




        console.log(players.length + " players left playing in " + games.length + " games");
        console.log(lobbys.length + " lobbys available");
    });

    socket.on('playerName', function (data) {
        if (data.name != "") {
            currentPlayer.name = data.name;
            console.log('Player ' + socket.id + ' is named ' + data.name);
        }
    });



    //LobbyEvents

    socket.on('createLobby', function (data) {
        if (!lobbyExists(data.name)) {
            currentLobby = new lobby();
            if (data.name != undefined)
                currentLobby.name = data.name;
            currentLobby.id = lobbys.length;
            currentPlayer.lobby = currentLobby.id;
            lobbys.push(currentLobby);
            console.log('Player Created Lobby: ' + currentLobby.name + " (" + currentPlayer.socketid + ")");
            socket.emit("lobbyCreated", currentLobby);
            removeEmptyLobbys();
            io.emit('pushLobbys', lobbys);
        } else {
            removeEmptyLobbys();
            socket.emit('errorMessage', { message: 'Lobby exists.' });
        }
    });

    socket.on('leaveLobby', function (data) {
        if (currentLobby != undefined) {
            currentPlayer.lobby = -1;
            console.log('Player left Lobby: ' + currentLobby.name + " (" + currentPlayer.socketid + ")");
            players.forEach(function (item, index) {
                if (item.lobby == currentLobby.id) {
                    socket.to(item.socketid).emit("playerLeftLobby", currentPlayer);
                }
            });
            currentLobby = undefined;
        }
        removeEmptyLobbys();
        io.emit('pushLobbys', lobbys);
    });

    socket.on('joinLobby', function (data) {
        let lobby = getLobbyByName(data.name);
        if (lobby == undefined) {
            socket.emit('errorMessage', { message: 'Lobby does not exist.' });
        } else {
            currentPlayer.lobby = lobby.id;
            currentLobby = lobby;
            console.log('Player Joined Lobby: ' + currentLobby.name + " (" + currentPlayer.socketid + ")");
            socket.emit("lobbyJoined", currentLobby);
            updateLobbyPlayers();
            players.forEach(function (item, index) {
                if (item.lobby == currentLobby.id) {
                    socket.to(item.socketid).emit("playerJoinedLobby", currentPlayer);
                }
            });
        }
    });

    socket.on('getLobbys', function (data) {
        removeEmptyLobbys();
        socket.emit('pushLobbys', lobbys);
    });

    socket.on('chatMessage', function (data) {

        players.forEach(function (item, index) {
            if (currentLobby != undefined) {
                if (item.lobby == currentLobby.id)
                    if (item.socketid != socket.id) {
                        socket.to(item.socketid).emit('chatMessage', data);
                    }
            }
            else {

            }
        });
    });

    socket.on('getLobbyPlayers', function (data) {
        updateLobbyPlayers();
    });

    socket.on('setReady', function (data) {
        currentPlayer.ready = data;
    });



    //Game Events

    socket.on('joinGame', function (data) {
        if (data == undefined) {
            games.forEach(function (item, index) {
                if (item.lobby == currentLobby.id)
                    currentGame = item;
            });

            if (currentGame == undefined) {

                let level = getLevelByLevelName("lvl1");
                currentGame = new game();
                currentGame.id = games.length;
                currentGame.lobby = currentLobby.id;
                currentGame.name = currentLobby.name + "_game";
                currentGame.elements = level.elements;
                currentGame.playerSpawn = level.playerSpawn;
                //printGameLayout();
                games.push(currentGame);
                console.log('GameCreated: ' + currentGame.name + " (" + currentGame.id + ")");
            }
        }
        else {
            currentGame = games[data];
        }

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
        console.log('Player Joined Game: ' + currentGame.name + " (" + currentPlayer.socketid + ")");

        socket.emit('gameJoined', currentGame);

        setInterval(function () {
            calculatePhysics();
        }, 1000 / 5);
    });

    socket.on('message', function (data) {
        players.forEach(function (item, index) {
            if (currentGame != undefined)
                if (item.game == currentGame.id)
                    if (item.socketid != socket.id) {
                        socket.to(item.socketid).emit('message', data);
                    }
        });
        switch (data.type) {
            case "moveplayer":
                currentPlayer.position = data.data;
                let elem = getElementAtPosition(data.data);
                let index = currentGame.elements.indexOf(elem);
                currentGame.elements.splice(index, 1);
                break;
            case "score":
                currentPlayer.score = data.data;
                break;
            case "die":
                currentPlayer.alive = false;
                break;
        }
    });

    socket.on('getLevel', function (data) {
        socket.emit('pushLevel', currentGame.elements)
    });


    //GameFunctions

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
                        let elem = getElementAtPosition({ x: x, y: y });

                        if (elem != undefined)
                            if (elem.type == BlockTypes.Stone || elem.type == BlockTypes.Morningstar || elem.type == BlockTypes.PowerUp || elem.type == BlockTypes.Diamond) {
                                let next = getElementAtPosition({ x: x, y: y + 1 });
                                if (next == undefined) {
                                    elem.falling++;
                                    if (!isPlayerAtPos({ x: x, y: y + 1 })) {
                                        elem.position = { x: x, y: y + 1 };
                                        socket.emit('message', {
                                            type: 'moveblock',
                                            data: {
                                                oldPos: { x: x, y: y },
                                                newPos: { x: x, y: y + 1 },
                                                id: elem.id
                                            }
                                        });
                                        players.forEach(function (player, playerindex) {
                                            if (currentGame.id == player.game) {
                                                if (player.socketid != socket.id) {
                                                    socket.to(player.socketid).emit('message', {
                                                        type: 'moveblock',
                                                        data: {
                                                            oldPos: { x: x, y: y },
                                                            newPos: { x: x, y: y + 1 },
                                                            id: elem.id
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        if (elem.falling > 1 || elem.type == BlockTypes.Morningstar)
                                            if (elem.type != BlockTypes.Diamond && elem.type != BlockTypes.PowerUp) {
                                                players.forEach(function (player, playerindex) {
                                                    if (player.position.x == x && player.position.y == y + 1)
                                                        if (currentGame.id == player.game) {
                                                            console.log('player ' + player.socketid + ' died');
                                                            io.sockets.to(player.socketid).emit('message', { type: 'death', data: { player: currentPlayer, element: elem } });
                                                        }
                                                });
                                            }
                                        elem.falling = 0;
                                    }
                                }
                            }

                    }
            }
    }

});


//Load all Levels

fs.readdir("level", (err, files) => {
    files.forEach(file => {
        console.log("Loading Level " + file);
        loadLevel(file.replace(".txt", ""));
    });
})




//ServerStartup

app.use(express.static("client/"));

var port = process.env.PORT || 1337;
http.listen(port, function () {
    console.log('listening on *:' + port);
});
