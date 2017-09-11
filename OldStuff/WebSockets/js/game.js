
//Global vars
var canvas;
var context;
var player;
var character;
var character_crushed;
var background;
var background2;
var background3;

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
    host: false,
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



var backgroundArray = CreateArray(dimensions.width, dimensions.height);

var blockArray = CreateArray(dimensions.width, dimensions.height);

function CreateBackground() {
    for (var x = 0; x < dimensions.width; x++) {
        for (var y = 0; y < dimensions.height; y++) {
            backgroundArray[x][y] = Math.round(Math.random() * 2);
        }
    }
}


function CreateLevel() {
    for (var x = 0; x < dimensions.width; x++) {
        for (var y = 0; y < dimensions.height; y++) {
            if (x != 0 || y != 0) {
                var chance = Math.round(Math.random() * 100);
                if (chance <= chances[BlockTypes.Dirt]) {
                    dirts.push(new GameElement(BlockTypes.Dirt, x, y));
                } else if (chance <= chances[BlockTypes.Gravel]) {
                    gravels.push(new GameElement(BlockTypes.Gravel, x, y));
                } else if (chance <= chances[BlockTypes.Stone]) {
                    stones.push(new GameElement(BlockTypes.Stone, x, y));
                } else if (chance <= chances[BlockTypes.Diamond]) {
                    diamonds.push(new GameElement(BlockTypes.Diamond, x, y));
                }
            }
        }
    }

    for (var i = 0; i < stones.length; i++) {
        chat.server.createObject(chat.lobby, stones[i].blockType, stones[i].pos);
    }
    for (var i = 0; i < dirts.length; i++) {
        chat.server.createObject(chat.lobby, dirts[i].blockType, dirts[i].pos);
    }
    for (var i = 0; i < gravels.length; i++) {
        chat.server.createObject(chat.lobby, gravels[i].blockType, gravels[i].pos);
    }
    for (var i = 0; i < diamonds.length; i++) {
        chat.server.createObject(chat.lobby, diamonds[i].blockType, diamonds[i].pos);
    }
}





function Physics() {
    if (player.host) {
        for (var i = 0; i < stones.length; i++) {
            stones[i].applyGravity();
        }
        for (var i = 0; i < dirts.length; i++) {
            dirts[i].applyGravity();
        }
        for (var i = 0; i < gravels.length; i++) {
            gravels[i].applyGravity();
        }
        for (var i = 0; i < diamonds.length; i++) {
            diamonds[i].applyGravity();
        }
    }
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

    let element = elementGrid.getElementAt(new Coord(player.x, player.y));



    if (element.blockType == BlockTypes.Stone) {
        player.x = lastx;
        player.y = lasty;
    } else if (element.blockType == BlockTypes.Diamond) {
        if (player.x != lastx || player.y != lasty) {
            diamondCount++;
            playRandomSound(pickupSounds);
        }
    } else if (player.x != lastx || player.y != lasty) {
        if (element.blockType == BlockTypes.Dirt) {
            playRandomSound(dirtSounds);
        } else if (element.blockType == BlockTypes.Gravel) {
            playRandomSound(gravelSounds);
        }
    }

    if (player.x != lastx || player.y != lasty) {
        //Removement - needs improvement

        element = elementGrid.getElementAt(new Coord(player.x, player.y));
        if (element != 0) {
            elementGrid.grid[player.x][player.y] = undefined;
            removeA(stones, element);
            removeA(dirts, element);
            removeA(gravels, element);
            removeA(diamonds, element);
            chat.server.destroyObject(chat.lobby,element.pos);
        }

        
    
                    


        chat.server.updatePosition(chat.lobby, player.x, player.y);
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
    canvas.style.width = '100%';
    canvas.style.height = '100%';
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

    for (var x = 0; x < dimensions.width; x++) {
        for (var y = 0; y < dimensions.height; y++) {
            switch (backgroundArray[x][y]) {
                case 0:
                    context.drawImage(background, x * imgWidth, y * imgheight, imgWidth, imgheight);
                    break;
                case 1:
                    context.drawImage(background2, x * imgWidth, y * imgheight, imgWidth, imgheight);
                    break;
                case 2:
                    context.drawImage(background3, x * imgWidth, y * imgheight, imgWidth, imgheight);
                    break;
                default:
                    context.drawImage(background, x * imgWidth, y * imgheight, imgWidth, imgheight);
                    break;

            }

        }
    }


    /*
    for (var x = 0; x < dimensions.width; x++) {
        for (var y = 0; y < dimensions.height; y++) {
            let element = elementGrid.getElementAt(new Coord(x, y));
            if (element != null && element != undefined)
            {
                context.drawImage(element.texture, parseInt(element.pos.X * imgWidth), parseInt(element.pos.Y * imgheight), parseInt(imgWidth), parseInt(imgheight));
            }
        }
    }
    */


    for (var i = 0; i < stones.length; i++) {
        context.drawImage(stones[i].texture, parseInt(stones[i].pos.X * imgWidth), parseInt(stones[i].pos.Y * imgheight), parseInt(imgWidth), parseInt(imgheight));
    }
    for (var i = 0; i < dirts.length; i++) {
        context.drawImage(dirts[i].texture, dirts[i].pos.X * imgWidth, dirts[i].pos.Y * imgheight, imgWidth, imgheight);
    }
    for (var i = 0; i < gravels.length; i++) {
        context.drawImage(gravels[i].texture, gravels[i].pos.X * imgWidth, gravels[i].pos.Y * imgheight, imgWidth, imgheight);
    }
    for (var i = 0; i < diamonds.length; i++) {
        context.drawImage(diamonds[i].texture, diamonds[i].pos.X * imgWidth, diamonds[i].pos.Y * imgheight, imgWidth, imgheight);
    }

    for (var i = 0; i < players.length; i++) {
        context.drawImage(players[i].texture, players[i].pos.X * imgWidth, players[i].pos.Y * imgheight, imgWidth, imgheight);
    }

    if (player.alive) {
        context.drawImage(character, player.x * imgWidth, player.y * imgheight, imgWidth, imgheight);
    } else {
        context.drawImage(character_crushed, player.x * imgWidth, player.y * imgheight, imgWidth, imgheight);
    }
    frame++;
}


function GameInit() {
    // Game init.
    
    character = document.getElementById('character');
    background = document.getElementById('background');
    background2 = document.getElementById('background2');
    background3 = document.getElementById('background3');
    character_crushed = document.getElementById('stone_crushed_player');
    

    canvas = document.getElementById("game");
    if (canvas.getContext) {
        context = canvas.getContext('2d');
        SetPixelated(context);
    }
    CreateBackground();
    if (player.host) {
        CreateLevel();
        chat.server.requestSecondInit();
    }
    else {
        chat.server.requestGameField(chat.lobby);
    }
}

function SecondInit() {
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
