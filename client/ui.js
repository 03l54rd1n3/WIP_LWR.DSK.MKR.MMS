import {DefaultGenerator} from "../common/generator/default";
import {LocalGameState, OnlineGameState} from "./state";
import * as settings from '../settings.json';
import {parseLevel} from '../common/generator/parser';

const $createOffline = document.getElementById('lobby-offline');
const $createOnline = document.getElementById('lobby-online');
const $lobbies = document.getElementById('lobby-sessions');
const $players = document.getElementById('scores-list');
const $messages = document.getElementById('chat-messages');
const $chat = document.getElementById('chat-input');

const generator = new DefaultGenerator({chances: settings.chances});

let socket, updates, callback;

const KEY_ENTER = 13;

// initialize eventHandlers
exports.init = (_socket, _updates, _callback) => {
    socket = _socket;
    updates = _updates;
    callback = _callback;

    $createOffline.onclick = createOfflineLobby;
    $createOnline.onclick = createOnlineLobby;
    $chat.addEventListener('keyup', (e) => {
        console.log(e);
        if (e.keyCode === KEY_ENTER) {
            const msg = $chat.value;
            $chat.value = '';
            displayChatMessage(msg);
            socket.emit('chat message', msg);
        }
    });

    socket.on('lobbies', displayLobbies);
    socket.on('chat message', displayChatMessage)
};

// start a local offline capable singleplayer lobby
function createOfflineLobby() {
    if (!callback) {
        return;
    }

    console.log('Creating new Local Session');
    const game = new LocalGameState('local', 32, 24);
    generator.random(game);
    game.spawnPlayer('Player Unknown');
    callback(game);
}

// create a new named online lobby
function createOnlineLobby() {
    const name = window.prompt('Please enter a lobby name: ');

    socket.emit('create lobby', {name});
}

// allows to connect to a onlin lobby from the js console
global.connect = (id) => {
    if (!callback || !updates) {
        return;
    }

    const nickname = window.prompt('Please enter your nickname:');

    const game = new OnlineGameState(updates, id, nickname);
    callback(game)
};

global.load = (level) => {
  if (!callback) {
      return;
  }

  const game = new LocalGameState('local', 32, 24);
  parseLevel(game, level);
  game.spawnPlayer('Player Unknown');
  callback(game);
};

// display available online lobbies in the left sidebar
function displayLobbies(lobbies) {
    $lobbies.innerHTML = '';

    lobbies.forEach((lobby) => {
        const $lobby = document.createElement('li');

        $lobby.innerHTML = `<span class="main">${lobby.name}</span>` +
            '<div class="ic-placeholder"><i class="ic-arrow"></i></div>';
        $lobby.onclick = () => global.connect(lobby.id);
        $lobbies.appendChild($lobby);
    });
}

// display players and score of the current session in the left sidebar
export function displayPlayers(players) {
    $players.innerHTML = '';
    const elements = {};

    for (const id in players) {
        const player = players[id];
        const $player = document.createElement('li');

        $player.innerHTML = `<span class="main">${player.nickname}</span>`;

        const $score = document.createElement('span');
        $score.className = 'score';
        $score.textContent = player.score;
        $player.appendChild($score);

        elements[player.id] = $score;
        $players.appendChild($player);
    }

    //Shortcut to update player scores
    return (players) => {
        for (const id in players) {
            const player = players[id];

            const $score = elements[id];
            if ($score) {
                $score.textContent = player.score;
            }
        }
    };
}

// display incoming chat message in the left sidebar
function displayChatMessage(message) {
    const $message = document.createElement('li')
    $message.textContent = message;

    $messages.appendChild($message);
}
