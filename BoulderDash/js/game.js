
window.onload = OnPageLoad;


//Global vars
var canvas;
var context;
var player;
var character;
var dirt;
var diamond;
var background;
var background2;
var background3;
var gravel;
var stone;

var time = 120;
var frame = 0;

var imgWidth = 32;
var imgheight = 32;

var diamondCount = 0;

var chances = [46, 92, 96, 100];

var gravity = 1;

var player = {
    x: 0,
    y: 0
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
            if (x != 0 && y != 0) {
                var chance = Math.round(Math.random() * 100);
                if (chance <= chances[BlockTypes.Dirt]) {
                    dirts.push(GameElement(BlockTypes.Dirt, x, y));
                } else if (chance <= chances[BlockTypes.Gravel]) {
                    gravels.push(GameElement(BlockTypes.Gravel, x, y));
                } else if (chance <= chances[BlockTypes.Stone]) {
                    stones.push(GameElement(BlockTypes.Stone, x, y));
                } else if (chance <= chances[BlockTypes.Diamond]) {
                    diamonds.push(GameElement(BlockTypes.Diamond, x, y));
                }
            }
        }
    }


    console.log(blockArray);
}





function Physics() {
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




    switch (data.key) {
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
    if (blockArray[player.x][player.y] == 2) {
        player.x = lastx;
        player.y = lasty;
    } else if (blockArray[player.x][player.y] == 3) {
        if (player.x != lastx || player.y != lasty) {
            diamondCount++;
            playRandomSound(pickupSounds);
        }
    } else if (player.x != lastx || player.y != lasty) {
        if (blockArray[player.x][player.y] == 0) {
            playRandomSound(dirtSounds);
        } else if (blockArray[player.x][player.y] != null) {
            playRandomSound(gravelSounds);
        }
    }


    blockArray[player.x][player.y] = null;
    console.log(player);
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
    var oldWidth = 1200 * 2;
    var oldHeight = 592 * 2;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;
    context.scale(ratio, ratio);
}


var PhysicsCooldown = 100;

function OnDraw() {
    PhysicsCooldown--;
    if (PhysicsCooldown < 0) {
        PhysicsCooldown = 100;
        Physics();
    }
    var score = document.getElementById('score');
    score.innerHTML = "Score: " + diamonds;
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


    for (var i = 0; i < stones.length; i++) {
        context.drawImage(stones[i].texture, stones[i].pos.X * imgWidth, stones[i].Y * imgheight, imgWidth, imgheight);
    }
    for (var i = 0; i < dirts.length; i++) {
        context.drawImage(dirts[i].texture, dirts[i].pos.X * imgWidth, dirts[i].Y * imgheight, imgWidth, imgheight);
    }
    for (var i = 0; i < gravels.length; i++) {
        context.drawImage(gravels[i].texture, gravels[i].pos.X * imgWidth, gravels[i].Y * imgheight, imgWidth, imgheight);
    }
    for (var i = 0; i < diamonds.length; i++) {
        context.drawImage(diamonds[i].texture, diamonds[i].pos.X * imgWidth, diamonds[i].Y * imgheight, imgWidth, imgheight);
    }
    context.drawImage(character, player.x * imgWidth, player.y * imgheight, imgWidth, imgheight);
    frame++;
}




function OnPageLoad(e) {
    // Game init.
    character = document.getElementById('character');
    dirt = document.getElementById('dirt');
    diamond = document.getElementById('diamond');
    background = document.getElementById('background');
    background2 = document.getElementById('background2');
    background3 = document.getElementById('background3');
    gravel = document.getElementById('gravel');
    stone = document.getElementById('stone');

    canvas = document.getElementById("game");
    if (canvas.getContext) {
        context = canvas.getContext('2d');
        SetPixelated(context);
    }
    CreateLevel();
    CreateBackground();
    var audio = new Audio('/music/factory_time.mp3');
    audio.play();
    audio.volume = 0.2;
    audio.addEventListener('ended', function () {
        this.currentTime = 0;
        this.volume = 0.2;
        this.play();
    }, false);
    document.addEventListener("keydown", OnKeyDown);
    setInterval(OnDraw, 1000 / 30);
}