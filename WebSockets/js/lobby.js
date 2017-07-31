
var joinLobbyClick = function (event) {
    if (chat.lobby != $(event.target).html()) {
        if (chat.lobby != undefined)
            chat.server.leaveLobby(chat.lobby);

        chat.server.joinLobby($(event.target).html());
    }
};
// Declare a proxy to reference the hub.
var chat = $.connection.messageHub;
chat.lobby = undefined;
// Create a function that the hub can call to broadcast messages.
chat.client.lobbyCreationFailed = function (message) {
    alert(message);
};
chat.client.lobbyJoinFailed = function (message) {
    alert(message);
};
chat.client.lobby = function (lobbies) {
    $('#lobbies').empty();
    for (let i = 0; i < lobbies.length; i++) {
        let name = lobbies[i].name;
        let players = lobbies[i].players;
        if (name == chat.lobby) {
            $('#lobbies').append('<li class="curlob"><strong class="lobby">' + name
                + '</strong>&nbsp;&nbsp; ' + players + '</li>');
        } else {
            $('#lobbies').append('<li class="lob"><strong class="lobby">' + name
                + '</strong>&nbsp;&nbsp; ' + players + '</li>');
        }
    }
    $('.lobby').unbind('click', joinLobbyClick);
    $('.lobby').bind('click', joinLobbyClick);
};

chat.client.players = function (players) {
    $('#players').empty();
    for (let i = 0; i < players.length; i++) {
        let name = players[i];
        $('#players').append('<li class="player">' + name + '</li>');
    }
};

chat.client.playerLeft = function (playername) {
    $('#chat').append('<li class="chatmessage">' + playername
        + '&nbsp;&nbsp;Left the lobby</li>');
}

chat.client.playerJoined = function (playername) {
    $('#chat').append('<li class="chatmessage">' + playername
        + '&nbsp;&nbsp;Joined the lobby</li>');
}

chat.client.chatMessage = function (playername, message) {
    $('#chat').append('<li class="chatmessage"><strong>' + playername
        + '</strong>:&nbsp;&nbsp; ' + message + '</li>');
};
chat.client.lobbyCreated = function (name) {
    chat.lobby = name;
};
chat.client.lobbyJoined = function (name) {
    chat.lobby = name;
};

chat.client.updateLobbies = function () {
    chat.server.getLobbies();
    chat.server.getPlayers(chat.lobby);
};



chat.client.updatePosition = function (playerid, x, y) {
    for (let i = 0; i < players.length; i++) {
        let remoPlayer = players[i];
        if (remoPlayer.id == playerid) {
            remoPlayer.updatePosition(new Coord(x, y));
            if (player.host) {
                element = elementGrid.getElementAt(new Coord(x, y));
                if (element != 0) {
                    elementGrid.grid[x][y] = null;
                    removeA(stones, element);
                    removeA(dirts, element);
                    removeA(gravels, element);
                    removeA(diamonds, element);
                    chat.server.destroyObject(chat.lobby, element.pos);
                }
            }
        }
    }
};

lobbyCon = {};

lobbyCon.updatedPosition = function (oldPos, newPos) {
    if (player.host) {
        if (oldPos.Y != -1 && oldPos.X != -1)
            chat.server.moveObject(chat.lobby, oldPos, newPos);
    }
}


chat.client.gameJoined = function (playerid, idp) {
    let playerObj = new GameElement(BlockTypes.RemotePlayer, 0, 0);
    playerObj.name = playerid;
    playerObj.id = idp;
    players.push(playerObj);
};

chat.client.setHost = function (isHost) {
    player.host = isHost;
};

chat.client.secondInit = function () {
    SecondInit();
};

chat.client.hostParams = function (isHost) {
    player.host = isHost;
    GameInit();
}

chat.client.createObject = function (type, x, y) {
    switch (type) {
        case BlockTypes.Dirt:
            dirts.push(new GameElement(BlockTypes.Dirt, x, y));
            break;
        case BlockTypes.Gravel:
            gravels.push(new GameElement(BlockTypes.Gravel, x, y));
            break;
        case BlockTypes.Diamond:
            stones.push(new GameElement(BlockTypes.Diamond, x, y));
            break;
        case BlockTypes.Stone:
            diamonds.push(new GameElement(BlockTypes.Stone, x, y));
            break;
    }
}

chat.client.moveObject = function (oldPos, newPos) {
    let element = elementGrid.getElementAt(oldPos);
    if (element != null && element != undefined && element != 0) {
        console.log(element)
        element.updatePosition(newPos);
    }
}

chat.client.destroyObject = function (pos) {
    element = elementGrid.getElementAt(pos);
    elementGrid.grid[pos.X][pos.Y] = undefined;
    removeA(stones, element);
    removeA(dirts, element);
    removeA(gravels, element);
    removeA(diamonds, element);

}



// Get the user name and store it to prepend to messages.
$('#displayname').val(prompt('Enter your PlayerName:', ''));
// Set initial focus to message input box.
$('#message').focus();
// Start the connection.
$.connection.hub.start().done(function () {
    $(window).unload(function () {
        chat.server.leaveLobby(chat.lobby);
        chat.server.quit();
    });

    chat.conId = chat.connection.id;

    $('#sendmessage').click(function () {
        if (chat.lobby != undefined)
            chat.server.leaveLobby(chat.lobby);

        chat.server.createLobby($('#message').val());
    });

    $('#sendchatmessage').click(function () {
        if (chat.lobby != undefined)
            chat.server.chatMessage(lobby, $('#chatmessage').val());
    });

    $('#joingame').click(function () {
        if (chat.lobby != undefined) {
            chat.server.joinGame(chat.lobby);
            $('#container').css("display", "none");
            $('#gamecontainer').css("display", "block");
            chat.server.requestHostParams(chat.lobby);
        }

    });

    chat.server.connect($('#displayname').val());
    chat.server.getLobbies();
});

