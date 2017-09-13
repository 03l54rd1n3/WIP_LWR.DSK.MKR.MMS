import io from 'socket.io-client';

import {LocalGameState, OnlineGameState} from "./state";
import {Renderer} from "./renderer";
import {Game} from "./game";
import {Keys} from "./keys";
import {init} from "./ui";
import {DefaultGenerator} from "../common/generator/default";
import {Player} from "../common/elements/player";

global.texture = require('./textures');

window.onload = () => {
    console.log('Loading Game');

    const canvas = document.getElementById("game");
    // Game init.
    if (!canvas || !canvas.getContext) {
        console.error('PANIC!! exit now');
        return;
    }

    const renderer = new Renderer(canvas, initCanvas(canvas));
    renderer.init();

    const socket = io();
    const updates = io('/updates');

    updates.on('failure', (msg) => {
        console.error(msg);
    });

    const keys = new Keys();
    document.addEventListener('keydown', keys.onDown.bind(keys));
    document.addEventListener('keyup', keys.onUp.bind(keys));


    //= new OnlineGameState(updates, 'wip', 'jochen', keys);

    /*const generator = new DefaultGenerator({chances: [46, 92, 96, 100]});
    const state = new LocalGameState(keys, 32, 24);
    generator.random(state);
    state.spawnPlayer('lolo');*/

    const game = new Game({
        keys,
        renderer
    });

    init(socket, updates, (lobby) => {
        game.stop();
        lobby.keys = keys;
        game.state = lobby;
        game.start();
    });

    console.log('Finished Loading');
}
;

function initCanvas(canvas, width = 32, height = 24, fieldSize = 16) {
    const context = canvas.getContext('2d');
    context['imageSmoothingEnabled'] = false;
    /* standard */
    context['mozImageSmoothingEnabled'] = false;
    /* Firefox */
    context['oImageSmoothingEnabled'] = false;
    /* Opera */
    context['webkitImageSmoothingEnabled'] = false;
    /* Safari */
    context['msImageSmoothingEnabled'] = false;
    /* IE */

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    const ratio = devicePixelRatio / backingStoreRatio;
    const oldWidth = width * fieldSize;
    const oldHeight = height * fieldSize;

    //canvas.style.width = '100%';
    //canvas.style.height = '100%';
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;

    context.scale(ratio, ratio);
    return context;
}