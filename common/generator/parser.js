const types = require('../types');

exports.parseLevel = (game, text) => {
  let pattern = /\s?[\n\r]+\s?/g;
  let lines = text.split(pattern);

  for(let x = 0; x < lines.length; x++) {
    parseLine(game, lines[i]);
  }
}

function parseLine(game, line) {
  line = line.toUpperCase();
  for(let y = 0; y < line.length; y++) {
    parseField(game, line[y]);
  }
}

function parseField(game, field) {
  let blockType = translateBlockType(field);

  if (blockType === types.Stone) {
    game.fields[x * game.height + y] = new MovingStone(x, y);
  } else {
    game.setField(x, y, new Block(blockType));
  }
}

function translateBlockType(char) {

  function rand() {
    const chance = Math.round(Math.random() * 100) + 1;
    if(chance < 50) {
      return types.Dirt;
    } else if(chance == 50) {
      return types.PowerUp;
    } else if(chance > 50) {
      return types.Gravel;
  }

  switch(char) {
    case "W":
      return types.Wall;
    case "D":
      return types.Diamond;
    case "X":
      return types.Player;
    case "R":
      return types.Stone;
    case "E":
      return types.Empty;
    case "P":
    case "C":
      return types.PowerUp;
    default: //case "#":
      return rand();
  }
}
