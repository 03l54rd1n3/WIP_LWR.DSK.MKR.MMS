export class Renderer {

    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
    }

    init() {
        this.score = document.getElementById('score');
        this.background = texture('background');
    }

    draw(game) {
        if(game.displayScores) {
            game.displayScores(game.players);
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        /*this.drawTexture(this.background,
            0, 0, this.canvas.width, this.canvas.height,
            game.step
        );*/

        for (const item of game.fields) {
            this.drawElement(item, game.step)
        }

        for (const item of game.rollingStones) {
            this.drawElement(item, game.step);
        }
    }

    drawElement(element, step) {
        if (!element || element.hidden) {
            return;
        }

        const {texture, x = 0, y = 0, width = 0, height = 0} = element;

        if (!texture) {
            return;
        }

        this.drawTexture(texture, x, y, width, height, step)
    }

    drawTexture(texture, x, y, width, height, step) {
        const {img, steps, offset} = texture;

        const i = (step + offset) % steps;

        this.context.drawImage(img,
            i * width, 0, width, height,
            x, y, width, height
        );
    }
}