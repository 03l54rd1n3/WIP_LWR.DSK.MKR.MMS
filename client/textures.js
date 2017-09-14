import * as Type from '../common/types';
import * as Theme from '../theme.json';

const TypeMapping = {
    "dirt": Type.Dirt,
    "gravel": Type.Gravel,
    "stone": Type.Stone,
    "diamond": Type.Diamond,
    "player": Type.Player,
    "wall": Type.Wall,
    "powerup": Type.PowerUp,
    "crushed": "crushed",
    "background": "background"
};

let Textures = {};
const {basePath, elements} = Theme;

function img(src) {
    const img = new Image();
    img.src = src;
    img.style.display = 'none';
    document.body.appendChild(img);

    return img;
}

function path(name) {
    if (name in elements) {
        return {
            img: img(basePath + elements[name].path),
            steps: elements[name].steps
        };
    }
    return {
        img: img('img/background2.png'),
        steps: 1
    };
}


for (let t in TypeMapping) {
    const type = TypeMapping[t];
    Textures[type] = path(t);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomAnimation(texture) {
    return Object.assign({
        offset: getRandomInt(0, texture.steps - 1)
    }, texture);
}

module.exports = (type) => {
    const textures = Textures[type];

    if (!textures) {
        return;
    }

    if (!(textures instanceof Array)) {
        return randomAnimation(textures);
    }

    if (textures.length === 0) {
        return;
    }

    const item = getRandomInt(0, textures.length);
    return randomAnimation(textures[item]);
};