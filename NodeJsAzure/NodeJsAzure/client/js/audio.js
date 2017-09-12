//Sounds
playRandomSound = function (soundArray) {
    let rand = getRandomInt(0, soundArray.length);
    let sound = soundArray[rand];
    sound.play();
};



//Sound Init

loadSoundFile = function (fileName) {
    let audio = new Audio('/sounds/' + fileName + '.ogg');
    return audio;
};

var dirtSounds = [];
dirtSounds.push(loadSoundFile("dirt1"));
dirtSounds.push(loadSoundFile("dirt2"));
dirtSounds.push(loadSoundFile("dirt3"));
dirtSounds.push(loadSoundFile("dirt4"));

var gravelSounds = [];
gravelSounds.push(loadSoundFile("gravel1"));
gravelSounds.push(loadSoundFile("gravel2"));
gravelSounds.push(loadSoundFile("gravel3"));
gravelSounds.push(loadSoundFile("gravel4"));

var pickupSounds = [];
pickupSounds.push(loadSoundFile("pickup"));
