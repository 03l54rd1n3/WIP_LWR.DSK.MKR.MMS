export class Game {

    constructor(paremeters) {
        const {renderer, settings = {}, state} = paremeters;

        this.renderer = renderer;
        this.settings = Object.assign({
            maxFPS: 60,
            timestep: 1000 / 60,
        }, settings);

        this.running = false;
        this.started = false;
        this.state = state;
    }

    stop() {
        this.running = false;
        this.started = false;
        cancelAnimationFrame(this.frameId);
    }

    start() {
        if (!this.started) {
            this.started = true;

            this.frameId = requestAnimationFrame((timestamp) => {
                this.renderer.draw(this.state);
                this.running = true;
                this.lastFrameTime = timestamp;
                this.frameId = requestAnimationFrame(this.main.bind(this));
            })
        }
    }

    main(timestamp) {
        if (timestamp < this.lastFrameTime + (1000 / this.settings.maxFPS)) {
            this.frameId = requestAnimationFrame(this.main.bind(this));
            return;
        }

        this.delta = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        let updateSteps = 0;
        while (this.delta >= this.settings.timestep) {
            this.state.update();
            this.delta -= this.settings.timestep;

            if (++updateSteps >= 240) {
                this.panic();
                break;
            }
        }

        this.renderer.draw(this.state);
        this.frameId = requestAnimationFrame(this.main.bind(this));
    }

    panic() {
        this.delta = 0;
    }
}