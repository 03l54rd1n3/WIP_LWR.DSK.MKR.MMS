//Global vars

//Canvas und Context
var canvas;
var context;
var drawHandle;

//Textures
var player;
var dirt;
var wall;
var stone;
var diamond;
var character;
var character_crushed;
var my_character_running_left;
var my_character_running_right;
var my_character_idle;
var diamond_rotate;
var morningstar;
var magicwall;
var background;
var explosion;
var powerup;

//Gamestate
var players = [];
var textures = [];
var elements = [];
var diamondCount = 0;

var time = 120;
var frame = 0;

var imgWidth = 16;
var imgheight = 16;

var lerpFactor = 0.3;


//Player-State
var player = {
    x: 0,
    y: 0,
    anim: 'idle',
    animIndex: 0,
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



//Functions


function getElementById(id) {
    let elem = { type: BlockTypes.Empty };
    elements.forEach(function (item, index) {
        if (item.id == id)
            elem = item;
    });
    return elem;
}

function getElementAtPosition(position) {
    let elem = { type: BlockTypes.Empty, position: position, currentPosition: position };
    elements.forEach(function (item, index) {
        if (item.position.x == position.x && item.position.y == position.y)
            elem = item;
    });
    return elem;
}


//Game Inits

function GameInit() {
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
    my_character_idle = document.getElementById('my_character_idle');
    my_character_running_left = document.getElementById('my_character_running_left');
    my_character_running_right = document.getElementById('my_character_running_right');
    diamond_rotate = document.getElementById('diamond_rotate');
    magicwall = document.getElementById('magicwall');
    morningstar = document.getElementById('morningstar');
    explosion = document.getElementById('explosion');
    powerup = document.getElementById('powerup');

    textures[BlockTypes.Diamond] = diamond_rotate;
    textures[BlockTypes.Stone] = stone;
    textures[BlockTypes.Wall] = wall;
    textures[BlockTypes.Dirt] = dirt;
    textures[BlockTypes.SmallWall] = wall;
    textures[BlockTypes.Morningstar] = morningstar;
    textures[BlockTypes.PowerUp] = powerup;
    textures[BlockTypes.Eplosion] = explosion;
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

function OnKeyDown(data) {
    if (player.alive == true) {
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

        let element = getElementAtPosition({ x: player.x, y: player.y });



        if (element.type == BlockTypes.Stone || element.type == BlockTypes.Wall || element.type == BlockTypes.SmallWall) {
            player.x = lastx;
            player.y = lasty;
        } else if (element.type == BlockTypes.Diamond) {
            if (player.x != lastx || player.y != lasty) {
                diamondCount++;
                playRandomSound(pickupSounds);
                socket.emit('message', {
                    type: 'score',
                    socketid: socket.id,
                    data: diamondCount
                });
            }
        } else if (player.x != lastx || player.y != lasty) {
            if (element.type == BlockTypes.Dirt) {
                playRandomSound(dirtSounds);
            } else if (element.type == BlockTypes.Gravel) {
                playRandomSound(gravelSounds);
            }
        }


        //Removement - needs improvement
        if (player.x != lastx || player.y != lasty) {
            socket.emit('message', { type: 'moveplayer', data: { x: player.x, y: player.y }, socketid: socket.id });
            let index = elements.indexOf(element);
            if (index > 0)
                elements.splice(index, 1);
        }

    }

}


//Graphics

function OnDraw() {
    var score = document.getElementById('score');
    score.innerHTML = "You: " + diamondCount;

    players.forEach(function (item, index) {
        score.innerHTML += "</br>" + item.name + ": " + item.score;
    });


    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (player.currentPos == undefined)
        player.currentPos = { x: player.x, y: player.y };
    player.currentPos = {
        x: lerp(player.currentPos.x, player.x, lerpFactor),
        y: lerp(player.currentPos.y, player.y, lerpFactor)
    };




    //Draw Player anim

    let xoff = player.currentPos.x - player.x;
    let yoff = player.currentPos.y - player.y;

    let anim = 'idle';

    if (xoff < -0.1) {
        //Move Left
        anim = 'left';
    } else if (xoff > 0.1) {
        //Move Right
        anim = 'right';
    } else {
        anim = 'idle';
    }

    if (player.anim != anim) {
        player.anim = anim;
        player.animIndex = 0;
    }

    if (player.alive) {
        let animTexture = my_character_idle;

        switch (player.anim) {
            case 'idle':
                animTexture = my_character_idle;
                break;

            case 'left':
                animTexture = my_character_running_left;
                break;

            case 'right':
                animTexture = my_character_running_right;
                break;
        }


        if ((player.animIndex) * 16 >= animTexture.naturalWidth)
            player.animIndex = 0;
        context.drawImage(animTexture, player.animIndex * imgWidth, 0, imgWidth, imgheight, player.currentPos.x * imgWidth, player.currentPos.y * imgheight, imgWidth, imgheight);
        player.animIndex++;
        //context.drawImage(character, player.currentPos.x * imgWidth, player.currentPos.y * imgheight, imgWidth, imgheight);
    } else {
        context.drawImage(character_crushed, player.currentPos.x * imgWidth, player.currentPos.y * imgheight, imgWidth, imgheight);
    }

    elements.forEach(function (item, index) {
        if (item.currentPosition == undefined || item.currentPosition == { x: 0, y: 0 })
            item.currentPosition = item.position;
        item.currentPosition = {
            x: lerp(item.currentPosition.x, item.position.x, lerpFactor / 2),
            y: lerp(item.currentPosition.y, item.position.y, lerpFactor / 2)
        };

        if (item.animIndex == undefined)
            item.animIndex = 0;

        let animTexture = textures[item.type];

        if ((item.animIndex) * 16 >= animTexture.naturalWidth)
            item.animIndex = 0;
        context.drawImage(animTexture, item.animIndex * imgWidth, 0, imgWidth, imgheight, item.currentPosition.x * imgWidth, item.currentPosition.y * imgheight, imgWidth, imgheight);
        item.animIndex++;
        //context.drawImage(textures[item.type], parseInt(item.currentPosition.x * imgWidth), parseInt(item.currentPosition.y * imgheight), parseInt(imgWidth), parseInt(imgheight));
    });

    players.forEach(function (item, index) {
        if (item.currentPos == undefined)
            item.currentPos = item.position;
        item.currentPos = {
            x: lerp(item.currentPos.x, item.position.x, lerpFactor),
            y: lerp(item.currentPos.y, item.position.y, lerpFactor)
        };
        context.drawImage(character, parseInt(item.currentPos.x * imgWidth), parseInt(item.currentPos.y * imgheight), parseInt(imgWidth), parseInt(imgheight));
    });
}


//Network-State

socket.on('message', function (data) {
    console.log(data);
    switch (data.type) {

        case "moveplayer":
            players.forEach(function (item, index) {
                if (item.socketid == data.socketid) {
                    item.position = data.data;
                    let elem = getElementAtPosition(data.data);
                    let index = elements.indexOf(elem);
                    if (index > 0)
                        elements.splice(index, 1);
                }
            });
            break;

        case "moveblock":
            let elem = getElementById(data.data.id);
            elem.position = data.data.newPos;
            break;

        case "score":
            players.forEach(function (item, index) {
                if (item.socketid == data.socketid) {
                    players[index].score = data.data;
                }
            });
            break;

        case "death":
            
            player.alive = false;
            break;
    }
});

socket.on('pushLevel', function (data) {
    elements = data;
});
socket.on('death', function (data) {
    player.alive = false;
});

socket.on('playerJoined', function (data) {
    players.push(data);
});

socket.on('gameJoined', function (data) {
    $('#container').css("display", "none");
    $('#gamecontainer').css("display", "block");
    GameInit();
    elements = data.elements;
    player.x = data.playerSpawn.x;
    player.y = data.playerSpawn.y;
});

