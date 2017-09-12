// Gibt eine Zufallszahl zwischen min (inklusive) und max (exklusive) zurück
// Die Verwendung von Math.round() erzeugt keine gleichmäßige Verteilung!
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

//Lerp
function lerp(current, desired, time) {
    return current + time * (desired - current);
}


//Create Array (Multi-Dimensional)
function CreateArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = CreateArray.apply(this, args);
    }

    return arr;
}


//Index-Of funtion for Stupid Browsers like IE
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (what, i) {
        i = i || 0;
        var L = this.length;
        while (i < L) {
            if (this[i] === what) return i;
            ++i;
        }
        return -1;
    };
}
