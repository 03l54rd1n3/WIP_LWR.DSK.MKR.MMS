import {GameState} from "../common/state";
import {Player} from "../common/elements/player";
import {Block} from "../common/elements/block";
import {MovingStone} from "../common/elements/stone";
import * as Type from "../common/types";

const localId = 1;

export class AnimatedGameState extends GameState {

    constructor(id, width, height) {
        super(id, width, height);

        this.step = 0;
        this.doStep = true;
    }

    update() {
        if (this.doStep) {
            this.step = (++this.step % 72);
            this.doStep = false;
        } else {
            this.doStep = true;
        }
        super.update();
    }

}

export class LocalGameState extends AnimatedGameState {

    handleMovement() {
        if (!this.keys || !this.localPlayer || this.localPlayer.isMoving) {
            return false;
        }

        let action;
        if (this.keys.up) {
            action = 'up';
        } else if (this.keys.right) {
            action = 'right';
        } else if (this.keys.down) {
            action = 'down';
        } else if (this.keys.left) {
            action = 'left';
        }

        if (action && this.onMove(localId, action)) {
            return true;
        }

        return false;
    }

    spawnPlayer(nickname) {
        const player = new Player(localId, 0, 0, nickname);

        this.setField(0, 0, player);
        this.players[localId] = player;
        this.localPlayer = player;
    }
}

export class OnlineGameState extends AnimatedGameState {
    constructor(socket, id, nickname) {
        super(id, 0, 0);

        this.socket = socket;
        this.moves = [];
        this.connectGame(nickname);
    }

    handleMovement() {
        let update = this.handleLocalMovement(), move;

        while (move = this.moves.shift()) {
            const {id, x, y} = move;
            const player = this.players[id];

            this.movePlayer(x, y, player);
            update = true;
        }
        return update;
    }

    handleLocalMovement() {
        if (!this.keys || !this.localPlayer || this.localPlayer.isMoving) {
            return false;
        }

        let action;
        if (this.keys.up) {
            action = 'up';
        } else if (this.keys.right) {
            action = 'right';
        } else if (this.keys.down) {
            action = 'down';
        } else if (this.keys.left) {
            action = 'left';
        }

        if (action && this.onMove(this.localPlayer.id, action)) {
            this.socket.emit('player move', action);
            return true;
        }

        return false;
    }

    connectGame(nickname) {
        this.socket.emit('join game', {
            id: this.id, nickname
        });

        this.socket.on('connected', (id) => {
            this.playerId = id;

            console.log('connected', id);
            if (this.players && this.players[id]) {
                this.localPlayer = this.players[id];
            }
        });

        //this.socket.on('player joined', this.addPlayer.bind(this));
        //this.socket.on('player left', this.removePlayer.bind(this));

        this.socket.on('reset game', (state) => {
            console.log('please reset');
            this.importState = state;
        });

        this.socket.on('failure', (msg) => console.error(msg));

        this.socket.on('player moved', (moves) => {
            this.moves = this.moves.concat(moves);
        });
    }

    update() {
        if (this.importState) {
            this.importGameState(this.importState);
            this.importState = undefined;
        }

        super.update();
    }

    importGameState(state) {
        const {
            id = this.id,
            width = this.width,
            height = this.height,
            players = {}, fields = [],
            rollingStones
        } = state;

        this.id = id;
        this.width = width;
        this.height = height;

        this.importFields(fields);
        this.importPlayers(players);
        this.importStones(rollingStones);
    }

    importFields(fields) {
        this.fields = new Array(this.width * this.height);
        let stones = 0;
        for (let i = 0; i < fields.length; i++) {
            const {posX = 0, posY = 0, _type = Type.Empty} = fields[i];

            if (_type === Type.Player) {
                continue;
            }

            if (_type === Type.Stone) {
                stones++;
                const {_posX, _posY} = fields[i];
                this.fields[_posX * this.height + _posY] = new MovingStone(_posX, _posY);
                continue;
            }


            this.setField(posX, posY, new Block(_type));
        }
    }

    importPlayers(players) {
        this.players = {};
        for (const id in players) {
            const {_posX = 0, _posY = 0, nickname} = players[id];

            const player = new Player(id, _posX, _posY, nickname);
            this.players[id] = player;
            this.setField(_posX, _posY, player);

            if (id === this.playerId) {
                this.localPlayer = player;
            }
        }
    }

    importStones(stones) {
        this.rollingStones = [];
        for (const stone of stones) {
            const {
                _posX: posX = 0,
                _posY: posY = 0
            } = stone;

            const item = new MovingStone(posX, posY);
            Object.assign(item, stone);
        }
    }
}