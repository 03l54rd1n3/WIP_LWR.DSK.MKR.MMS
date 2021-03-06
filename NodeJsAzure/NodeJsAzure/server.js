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
        this.alive = true;
        this.score = 0;
        this.alive = true;
        this.physicsHandle = undefined;
    }
}

class game {
    constructor() {
        this.time = 120;
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
    Explosion: 9,
    Exit: 10
}


//Global Functions

function loadLevel(name) {

    let curlevel = new level();
    curlevel.name = name;
    let readable = fs.readFile("level/" + name + ".txt", 'utf8', function (err, data) {

        data = data.replace('\r', '\n');
        data = data.replace('\n\n', '\n');
        let rows = data.split('\n');
        rows.forEach(function (rowStr, row) {
            rowStr = rowStr.replace('\uFEFF', '');
            rowStr = rowStr.replace('\n', '');
            rowStr = rowStr.replace('\r', '');
            for (var i = 0; i < rowStr.length; i++) {
                let column = i;
                let chunk = rowStr.charAt(i);

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
                    case "P":
                        elem.type = BlockTypes.Dirt;
                        break;
                    case "#":
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
                    case "e":
                        elem.type = BlockTypes.Empty;
                        break;
                    case "X":
                        curlevel.playerSpawn = { x: column, y: row };
                        elem.type = BlockTypes.Empty;
                        break;
                    default:
                        elem.type = BlockTypes.Dirt;
                        console.log("Unknown Char: " + chunk);
                        break;
                }
                if (elem.type != BlockTypes.Empty)
                    curlevel.elements.push(elem);

            }
        });
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
        if (item.name == name)
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
    var physicsHandle = undefined;
    console.log('Player ' + socket.id + ' connected');
    var currentPlayer = new player();
    var currentGame = undefined;
    var currentLobby = undefined;

    currentPlayer.id = players.length;
    currentPlayer.socketid = socket.id;
    players.push(currentPlayer);


    //Generic Functions

    function updateLobbyPlayers() {
        let lobbyPlayers = [];
        setTimeout(function () {
            players.forEach(function (item, index) {
                if (item.lobby == currentLobby.id) {
                    lobbyPlayers.push(item);
                }
            });
            socket.emit('pushPlayers', lobbyPlayers);
        }, 0);
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
        if (currentGame != undefined)
            if (currentGame.elements != undefined)
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
            if (count == 0)
                games.splice(currentGame.id, 1);
        }
        removeEmptyLobbys();

        clearInterval(physicsHandle);



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
            currentLobby.lvlname = data.level;
            currentLobby.id = lobbys.length;
            currentPlayer.lobby = currentLobby.id;
            lobbys.push(currentLobby);
            console.log('Player Created Lobby: ' + currentLobby.name + " (" + currentPlayer.socketid + ") " + currentLobby.lvlname);
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
                    setTimeout(function () {
                        socket.to(item.socketid).emit("playerJoinedLobby", currentPlayer);
                    }, 0);
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

                let level = getLevelByLevelName(currentLobby.lvlname);
                currentGame = new game();
                currentGame.time = 120;
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

        physicsHandle = setInterval(function () {
            gameLoop();
        }, 1000 / 5);
    });

    socket.on('leaveGame', function (data) {
        currentPlayer.game = -1;
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
            if (count == 0)
                games.splice(currentGame.id, 1);
        }
        currentGame = undefined;
        currentPlayer.position = { x: 0, y: 0 };
        currentPlayer.currentPosition = { x: 0, y: 0 };
        currentPlayer.alive = true;
        currentPlayer.score = 0;

        clearInterval(currentPlayer.physicsHandle);

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

    socket.on('getLevels', function (data) {
        let lvlnames = [];

        levels.forEach(function (item, index) {
            if (-1 == lvlnames.indexOf(item.name))
                lvlnames.push(item.name);
        });
        socket.emit('pushLevelNames', lvlnames);
    });

    //GameFunctions

    function isPlayerAtPos(position) {
        let found = false;
        players.forEach(function (player, playerindex) {
            if (currentGame.id == player.game)
                if (player.alive) {
                    if (player.position.x == position.x && player.position.y == position.y)
                        found = true;
                }
        });
        return found;
    }

    function getPlayerAtPos(position) {
        let found = undefined;
        players.forEach(function (player, playerindex) {
            if (currentGame.id == player.game)
                if (player.alive) {
                    if (player.position.x == position.x && player.position.y == position.y)
                        found = player;
                }
        });
        return found;
    }

    function isAtLeast1PlayerAlive() {
        let alive = false;
        players.forEach(function (item, index) {
            if (currentGame.id == item.game)
                if (!alive)
                    alive = item.alive;
        });
        return alive;
    }

    function gameLoop() {
        if (currentGame != undefined)

            //Spieler ist Host
            if (currentGame.host == socket.id) {
                //Ist die Zeit Vorbei ?

                //Count Diamonds left
                let diamondCountLeft = 0;

                checkTime();

                //Physics
                if (currentGame.time > 0) {
                    for (let x = 0; x < 32; x++)
                        for (let y = 22; y > 0; y--) {
                            let elem = getElementAtPosition({ x: x, y: y });

                            checkBlockTimeout(elem, x, y);

                            if (elem != undefined) {
                                let oldPos = elem.position;

                                if (elem.type == BlockTypes.Diamond)
                                    diamondCountLeft++;
                                
                                if (elem != undefined)
                                    if (elem.type == BlockTypes.Stone || elem.type == BlockTypes.Morningstar || elem.type == BlockTypes.PowerUp || elem.type == BlockTypes.Diamond) {
                                        let next = getElementAtPosition({ x: x, y: y + 1 });
                                        //Check Lower Element
                                        if (next == undefined) {
                                            elem.falling++;
                                            if (!isPlayerAtPos({ x: x, y: y + 1 })) {
                                                //Move block down
                                                elem.position = { x: x, y: y + 1 };

                                            }
                                            else {
                                                //Player is below Block - Check if it kills him
                                                checkBlockKillsPlayer(elem, x, y);
                                            }
                                        }
                                        else {
                                            //Check Left Element
                                            next = getElementAtPosition({ x: x - 1, y: y + 1 });
                                            if (next == undefined && !isPlayerAtPos({ x: x - 1, y: y + 1 })) {
                                                let left = getElementAtPosition({ x: x - 1, y: y });
                                                if (left == undefined)
                                                    if (!isPlayerAtPos({ x: x - 1, y: y })) {
                                                        elem.position = { x: x - 1, y: y };
                                                        elem.falling = 0;
                                                    }
                                            }
                                            else {
                                                //Check Right Element
                                                next = getElementAtPosition({ x: x + 1, y: y + 1 });
                                                if (next == undefined && !isPlayerAtPos({ x: x + 1, y: y + 1 })) {
                                                    let left = getElementAtPosition({ x: x + 1, y: y });
                                                    if (left == undefined)
                                                        if (!isPlayerAtPos({ x: x + 1, y: y })) {
                                                            elem.position = { x: x + 1, y: y };
                                                            elem.falling = 0;
                                                        }
                                                }
                                            }


                                        }
                                    }
                                sendChangeToClients(elem, oldPos);
                            }
                        }
                    //Diamond Count Check
                    if (diamondCountLeft == 0)
                    {
                        players.forEach(function (item, index) {
                            if (currentGame.id == item.game)
                                io.sockets.to(item.socketid).emit('message', { type: 'endGame' });
                        });
                        currentGame.time = -11;
                    }
                }
            }

        function checkTime() {
            if (currentGame.time < 0 && currentGame.time != -11) {
                players.forEach(function (item, index) {
                    if (currentGame.id == item.game)
                        io.sockets.to(item.socketid).emit('message', { type: 'endTime', data: 0 });
                });
            }
            else if (currentGame.time != -11) {
                currentGame.time -= 0.2;

                if (currentGame.time % 1 != 0)
                    players.forEach(function (item, index) {
                        if (currentGame.id == item.game)
                            io.sockets.to(item.socketid).emit('message', { type: 'time', data: currentGame.time });
                    });

                if (!isAtLeast1PlayerAlive()) {
                    players.forEach(function (item, index) {
                        if (currentGame.id == item.game)
                            io.sockets.to(item.socketid).emit('message', { type: 'endGame' });
                    });
                    currentGame.time = -11;
                }
            }
        }

        function sendChangeToClients(elem, oldPos) {
            //Send Change to clients
            if (elem.position.x != oldPos.x || elem.position.y != oldPos.y) {
                players.forEach(function (player, playerindex) {
                    if (currentGame.id == player.game) {
                        io.sockets.to(player.socketid).emit('message', {
                            type: 'moveblock',
                            data: {
                                oldPos: oldPos,
                                newPos: elem.position,
                                id: elem.id
                            }
                        });
                    }
                });
            }
            else {
                elem.falling = 0;
            }
        }

        function checkBlockKillsPlayer(elem, x, y) {
            if (elem != undefined)
                if (elem.falling > 1 || elem.type == BlockTypes.Morningstar)
                    if (elem.type != BlockTypes.Diamond && elem.type != BlockTypes.PowerUp) {
                        //Player at this pos will die.
                        players.forEach(function (player, playerindex) {
                            if (player.position.x == x && player.position.y == y + 1)
                                if (currentGame.id == player.game) {
                                    player.alive = false;
                                    players.forEach(function (item, index) {
                                        if (currentGame.id == item.game)
                                            io.sockets.to(item.socketid).emit('message', { type: 'death', data: { player: player, element: elem } });
                                    });
                                    for (x = -1; x < 2; x++)
                                        for (y = -1; y < 2; y++) {
                                            let elem = getElementAtPosition({ x: player.position.x + x, y: player.position.y + y });
                                            if (elem != undefined) {
                                                elem.type = BlockTypes.Explosion;
                                                elem.aliveTime = 6;
                                                players.forEach(function (item, index) {
                                                    if (currentGame.id == item.game)
                                                        io.sockets.to(item.socketid).emit('message', { type: 'changeblock', data: { block: elem } });
                                                });
                                            } else {
                                                let elem = new element();
                                                elem.position = { x: player.position.x + x, y: player.position.y + y };
                                                elem.currentPosition = { x: player.position.x + x, y: player.position.y + y };
                                                elem.type = BlockTypes.Explosion;
                                                elem.aliveTime = 6;
                                                elem.id = currentGame.elements.length;

                                                currentGame.elements.push(elem);

                                                players.forEach(function (item, index) {
                                                    if (currentGame.id == item.game)
                                                        io.sockets.to(item.socketid).emit('message', { type: 'addblock', data: { block: elem } });
                                                });
                                            }
                                        }
                                }
                        });
                    }
            elem.falling = 0;
        }

        function checkBlockTimeout(elem, x, y) {
            if (elem != undefined)
                if (elem.aliveTime != undefined) {
                    elem.aliveTime--;
                    if (elem.aliveTime <= 0) {
                        let index = currentGame.elements.indexOf(elem);
                        currentGame.elements.splice(index, 1);
                        players.forEach(function (player, playerindex) {
                            if (currentGame.id == player.game) {
                                io.sockets.to(player.socketid).emit('message', {
                                    type: 'killblock',
                                    data: elem
                                });
                            }
                        });
                        elem = undefined;
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
