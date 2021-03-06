﻿window.onload = OnPageLoad;

var socket = io('http://localhost:1337/');
socket.on('connect', function () { });
socket.on('event', function (data) { });
socket.on('disconnect', function () { });

//Global vars
var canvas;
var context;
var player;
var dirt;
var wall;
var stone;
var diamond;

var character;
var character_crushed;
var background;

var players = [];

var textures = [];
var elements = CreateArray(dimensions.width, dimensions.height);

var time = 120;
var frame = 0;

var imgWidth = 32;
var imgheight = 32;

var diamondCount = 0;

var chances = [46, 92, 96, 100];

var gravity = 1;

var drawHandle;


var player = {
    x: 0,
    y: 0,
    alive: true,
    getCoord: function () {
        return new Coord(this.x, this.y);
    },
    onDeath: function () {
        this.alive = false;
        clearInterval(drawHandle);
        OnDraw();
    }
};


function Physics() {
}

/*

function PlayOneShot(name) {
    var audio = new Audio('/sounds/' + name + '.ogg');
    audio.play();
}
function PlayRandomOneShot(name) {
    var rand = Math.round(Math.random() * 3) + 1;
    var audio = new Audio('/sounds/' + name + rand + '.ogg');
    audio.play();
}

*/

function OnKeyDown(data) {

    var lastx = player.x;
    var lasty = player.y;




    switch (data.key.toLowerCase()) {
        case "w":
            player.y--;
            break;
        case "s":
            player.y++;
            break;
        case "a":
            player.x--;
            break;
        case "d":
            player.x++;
            break;
    }

    if (player.x < 0)
        player.x = 0;
    if (player.x > dimensions.width - 1)
        player.x = dimensions.width - 1;

    if (player.y < 0)
        player.y = 0;
    if (player.y > dimensions.height - 1)
        player.y = dimensions.height - 1;

    let element = elements[player.x][player.y];



    if (element == BlockTypes.Stone || element == BlockTypes.Wall || element == BlockTypes.SmallWall) {
        player.x = lastx;
        player.y = lasty;
    } else if (element == BlockTypes.Diamond) {
        if (player.x != lastx || player.y != lasty) {
            diamondCount++;
            playRandomSound(pickupSounds);
        }
    } else if (player.x != lastx || player.y != lasty) {
        if (element == BlockTypes.Dirt) {
            playRandomSound(dirtSounds);
        } else if (element == BlockTypes.Gravel) {
            playRandomSound(gravelSounds);
        }
    }


    //Removement - needs improvement
    if (player.x != lastx || player.y != lasty) {
        socket.emit('message', { type: 'moveplayer', data: { x: player.x, y: player.y }, socketid: socket.id });
        elements[player.x][player.y] = BlockTypes.Empty;
    }



}

function SetPixelated(context) {
    context['imageSmoothingEnabled'] = false;       /* standard */
    context['mozImageSmoothingEnabled'] = false;    /* Firefox */
    context['oImageSmoothingEnabled'] = false;      /* Opera */
    context['webkitImageSmoothingEnabled'] = false; /* Safari */
    context['msImageSmoothingEnabled'] = false;     /* IE */
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    var ratio = devicePixelRatio / backingStoreRatio;
    var oldWidth = dimensions.width * imgWidth;
    var oldHeight = dimensions.height * imgheight;
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;
    context.scale(ratio, ratio);
}


var PhysicsCooldown = 5;

function OnDraw() {
    PhysicsCooldown--;
    if (PhysicsCooldown < 0) {
        PhysicsCooldown = 5;
        Physics();
    }
    var score = document.getElementById('score');
    score.innerHTML = "Score: " + diamondCount;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (player.alive) {
        context.drawImage(character, player.x * imgWidth, player.y * imgheight, imgWidth, imgheight);
    } else {
        context.drawImage(character_crushed, player.x * imgWidth, player.y * imgheight, imgWidth, imgheight);
    }

    for (var x = 0; x < dimensions.width; x++) {
        for (var y = 0; y < dimensions.height; y++) {
            let element = elements[x][y];
            if (element != null && element != undefined) {
                if (textures[element] != undefined)
                    context.drawImage(textures[element], parseInt(x * imgWidth), parseInt(y * imgheight), parseInt(imgWidth), parseInt(imgheight));
            }
        }
    }

    players.forEach(function (item, index) {
        context.drawImage(character, parseInt(item.position.x * imgWidth), parseInt(item.position.y * imgheight), parseInt(imgWidth), parseInt(imgheight));
    });
}




function OnPageLoad(e) {
    // Game init.

    dirt = document.getElementById('dirt');
    wall = document.getElementById('wall');
    stone = document.getElementById('stone');
    diamond = document.getElementById('diamond');
    character = document.getElementById('character');
    background = document.getElementById('background');
    background2 = document.getElementById('background2');
    background3 = document.getElementById('background3');
    character_crushed = document.getElementById('stone_crushed_player');

    textures[BlockTypes.Diamond] = diamond;
    textures[BlockTypes.Stone] = stone;
    textures[BlockTypes.Wall] = wall;
    textures[BlockTypes.Dirt] = dirt;
    textures[BlockTypes.SmallWall] = wall;
    textures[BlockTypes.Diamond] = diamond;
    textures[BlockTypes.Empty] = undefined;



    canvas = document.getElementById("game");
    if (canvas.getContext) {
        context = canvas.getContext('2d');
        SetPixelated(context);
    }

    var audio = new Audio('/music/factory_time.mp3');
    audio.play();
    audio.volume = 0.2;
    audio.addEventListener('ended', function () {
        this.currentTime = 0;
        this.volume = 0.2;
        this.play();
    }, false);
    document.addEventListener("keydown", OnKeyDown);
    drawHandle = setInterval(OnDraw, 1000 / 30);


    socket.on('gameCreated', function (data) {
        socket.emit('joinGame', data.id);
    });

    socket.on('pushGames', function (data) {
        if (data.length == 0) {
            socket.emit('createGame', { name: 'testgame' });
        }
        else {
            socket.emit('joinGame', data[0].id);
        }
    });

    socket.on('gameJoined', function (data) {
        elements = data.elements;
        player.x = data.playerSpawn.x;
        player.y = data.playerSpawn.y;
        console.log(data);
    });

    socket.on('message', function (data) {
        console.log(data);
        switch (data.type) {

            case "moveplayer":
                players.forEach(function (item, index) {
                    if (item.socketid == data.socketid) {
                        item.position = data.data;
                        elements[data.data.x][data.data.y] = BlockTypes.Empty;
                    }
                });
                break;

            case "moveblock":
                let elem = elements[data.data.oldPos.x][data.data.oldPos.y];
                elements[data.data.oldPos.x][data.data.oldPos.y] = BlockTypes.Empty;
                elements[data.data.newPos.x][data.data.newPos.y] = elem;
                break;
        }
    });

    socket.on('pushLevel', function (data) {

    });

    socket.on('playerJoined', function (data) {
        players.push(data);
    });

    socket.emit('getGames');



}