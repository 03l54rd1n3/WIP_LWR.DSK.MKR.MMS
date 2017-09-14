# Boulder Dash

**Projektstart** 18.07.2017

**Version** 1.0 (13.09.2017)

**Autoren** Daniel Struck, Marius Mertens, Maximilian Kenfenheuer, Lennart Wörmer

## Start

**Homepage** http://boulderdash.lennartwoermer.de
**Spiel** http://lwrdskmkrmms.azurewebsites.net

## Game & Features

Boulder Dash, erstmals 1984 von First Star Software für Atari 8-Bit Computer entwickelt, ist ein 2D-Videospiel, in dem der Spieler unter Beachtung verschiedener Hindernisse alle auf dem Spielfeld verteilten Diamanten einsammeln muss.

Dieser weiterentwickelten Version von Boulder Dash wurden einige Funktionen hinzugefügt:

* Der Spieler kann sogenannte Power-Ups einsammeln, die die Gravitation umkehren. Weitere Effekte folgen in der nächsten Version.
* Über eine vorgeschaltete Lobby können mehrere Spieler zusammen spielen (Multiplayer).
* Plattformübergreifendes Spielen ist dank moderner Webtechnologien möglich.

## Behind the Scenes

Im Folgenden ein Einblick in die verwendeten Technologien hinter Boulder Dash:

* Das Fontend ist in JavaScript, HTML5 sowie CSS3 umgesetzt sowie vollständig flexibel an alle gängigen  Bildschirmgrößen skalierbar (Responsive Webdesign).
* Das Backend ist in Node.js geschrieben.
* Validierungen finden sowohl auf Client-Seite (JavaScript im Browser) sowie auf Server-Seite (Node.js) durchgeführt.

## Browserkompatibilität

Boulder Dash ist auf der Mehrheit der modernen Webbrowsern ausführbar. Dazu gehören insbesondere Folgende:

* Mozilla Firefox
* Google Chrome
* Opera

Folgende Internet Browser sind noch nicht vollständig kompatibel, darunter:

* Microsoft Edge
* Microsoft Internet Explorer
* Apple Safari

Wir arbeiten daran, in den nächsten Versionen die Browserkompatibilität zu erhöhen.

Weitere Browserkompatibilität wird in den nächsten Veröffentlichungen hergestellt - darunter auch Internet Explorer und Microsoft Edge.

## Referenzen

* Node.js - Plattform, um JavaScript Server-seitig ausführen zu lassen (https://github.com/nodejs/node/blob/master/LICENSE)
* Express - Nutzbarkeit von Routen (The MIT License, https://github.com/expressjs/express/blob/master/LICENSE)
* Socket.io - ermöglicht Web-Sockets zu verwenden und stellt Realtime-Kommunikation bereit (The MIT License, https://github.com/socketio/socket.io/blob/master/LICENSE)
* Babel - stellt Abwärtskompatibilität her bzgl. JavaScript (The MIT License, https://github.com/babel/babel/blob/master/LICENSE)
* Webpack - packt JavaScript-Module und macht sie ausführbar (The MIT License, https://github.com/webpack/webpack/blob/master/LICENSE)
* uuid - Generierung von eindeutigen Spiel-IDs (The MIT License, https://github.com/kelektiv/node-uuid/blob/master/LICENSE.md)

## Known Bugs

* Wenn mehrere Spieler gleichzeitig das Spiel betreten, kann es sein, dass sich die Spieler nicht sehen, bevor sie sich bewegen.

## Bestandteile

* Daniel Struck: Backend, Fontend
* Marius Mertens: Backend, ReadMe
* Maximilian Kenfenheuer: Backened, Assets
* Lennart Wörmer: Server-Architektur, WordPress, ReadMe, Pitchslide
