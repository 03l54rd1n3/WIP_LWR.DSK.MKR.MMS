import {DefaultGenerator} from "../common/generator/default";
import {LocalGameState, OnlineGameState} from "./state";

const createOffline = document.getElementById('lobby-offline');
const createOnline = document.getElementById('lobby-online');
const sessions = document.getElementById('lobby-sessions');

const generator = new DefaultGenerator({chances: [46, 92, 96, 100]});

let socket, updates, callback;

//displayLobbies([{name: 'test', id: 'wip'}, {name: 'lolo', id: 'wip'}]);
exports.init = (_socket, _updates, _callback) => {
    socket = _socket;
    updates = _updates;
    callback = _callback;

    createOffline.onclick = createOfflineLobby;
    createOnline.onclick = createOnlineLobby;

    socket.on('lobbies', displayLobbies);
};

function createOfflineLobby() {
    if (!callback) {
        return;
    }

    const level = window.prompt('Paste your level file or leave empty for a generated level');

    console.log('Creating new Local Session');
    const game = new LocalGameState('local', 32, 24);
    generator.random(game);
    game.spawnPlayer('Player Unknown');
    callback(game);
}

function createOnlineLobby() {
    const name = window.prompt('Please enter a lobby name: ');

    socket.emit('create lobby', {name});
}

global.connect = (id) => {
    if (!callback || !updates) {
        return;
    }

    const nickname = window.prompt('Please enter your nickname:');

    const game = new OnlineGameState(updates, id, nickname);
    callback(game)
};

function displayLobbies(lobbies) {
    sessions.innerHTML = '';

    lobbies.forEach((l) => {
        const e = document.createElement('li');
        e.textContent = l.name;
        e.onclick = () => global.connect(l.id);
        sessions.appendChild(e);
    });
}