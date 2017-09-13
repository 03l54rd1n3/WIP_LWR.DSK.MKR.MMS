export class Keys {

    constructor() {
        this.pressed = new Set();
    }

    get up() {
        return this.pressed.has('KeyW')
            || this.pressed.has('ArrowUp');
    }

    get right() {
        return this.pressed.has('KeyD')
            || this.pressed.has('ArrowRight');
    }

    get down() {
        return this.pressed.has('KeyS')
            || this.pressed.has('ArrowDown');
    }

    get left() {
        return this.pressed.has('KeyA')
            || this.pressed.has('ArrowLeft');
    }

    get space() {
        return this.pressed.has('Space');
    }

    onDown(event) {
        this.pressed.add(event.code);
    }

    onUp(event) {
        this.pressed.delete(event.code);
    }
}