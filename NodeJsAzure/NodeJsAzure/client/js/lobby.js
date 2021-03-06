﻿//Window Loaded
window.onload = initLobby;

//Socket-Init

var socket = io('/');
socket.on('connect', function () { });
socket.on('event', function (data) { });
socket.on('disconnect', function () { });

//Lobby-State
var lobby = undefined;
var playerName = "";
var lobbys = [];

//Join Lobby Function
var joinLobbyClick = function (event) {
    if (lobby != undefined) {
        socket.emit('leaveLobby');
        $('#chat').append('<li class="chatmessage">You left lobby ' + lobby.name + '</li>');
    }
    socket.emit('joinLobby', { name: $(event.target).html() });
};

//Rebuild Lobbys

function rebuildLobbys() {
    $('#lobbies').empty();
    lobbys.forEach(function (item, index) {
        if (lobby != undefined) {
            if (lobby.name == item.name) {
                $('#lobbies').append('<li class="curlob"><strong class="lobby">' + item.name + '</strong></li>');
            }
            else {
                $('#lobbies').append('<li class="lob"><strong class="lobby">' + item.name + '</strong></li>');
            }
        }
        else {
            $('#lobbies').append('<li class="lob"><strong class="lobby">' + item.name + '</strong></li>');
        }
    });
    $('.lobby').unbind('click', joinLobbyClick);
    $('.lobby').bind('click', joinLobbyClick);
}


//Lobby-Init

function initLobby() {
    //Init

    //Get Player Name
    playerName = prompt('Please enter your PlayerName:');
    //Set Player Name
    socket.emit('playerName', { name: playerName });
    //Empty Lobby Display (Unnescessary?)
    $('#lobbies').empty();

    //Start Lobby Query
    socket.emit('getLobbys');
    socket.emit('getLevels');

    //Level Push

    socket.on('pushLevelNames', function (data) {
        $('#lvlselect').empty();
        data.forEach(function (item, index) {
            $('#lvlselect').append('<option>' + item + '</option>');
        });
    });



    //User Interactions

    $('#joingame').click(function () {
        socket.emit('joinGame', undefined);
    });

    $('#createlobby').click(function () {
        if (lobby != undefined) {
            socket.emit('leaveLobby');
            $('#chat').append('<li class="chatmessage">You left lobby ' + lobby.name + '</li>');
        }
        socket.emit('createLobby', { name: $('#lobby').val(), level: $('#lvlselect').val()});
    });


    //ChatMessage
    socket.on('chatMessage', function (data) {
        $('#chat').append('<li class="chatmessage"><strong>' + data.name
            + '</strong>:&nbsp;&nbsp; ' + data.message + '</li>');
    });

    $('#chatmessage').keypress(function (e) {
        if (e.which == 13) {
            socket.emit('chatMessage', { name: playerName, message: $('#chatmessage').val() });
            $('#chat').append('<li class="chatmessage"><strong>' + playerName
                + '</strong>:&nbsp;&nbsp; ' + $('#chatmessage').val() + '</li>');
            $('#chatmessage').val('');
            $('#chatmessage').focus();
        }
    });


    //Lobby-Logic
    socket.on('lobbyJoined', function (data) {
        //socket.emit('getLobbys');
        lobby = data;
        rebuildLobbys();
        $('#chat').append('<li class="chatmessage">You joined lobby ' + lobby.name + '</li>');
    });

    socket.on('lobbyCreated', function (data) {
        //socket.emit('getLobbys');
        /*
        $('#lobbies').append('<li class="curlob"><strong class="lobby">' + data.name + '</strong></li>');
        $('.lobby').unbind('click', joinLobbyClick);
        $('.lobby').bind('click', joinLobbyClick);
        */
        lobby = data;
        $('#chat').append('<li class="chatmessage">You created lobby ' + lobby.name + '</li>');
    });

    socket.on('pushLobbys', function (data) {
        lobbys = data;
        rebuildLobbys();
        $('.lobby').unbind('click', joinLobbyClick);
        $('.lobby').bind('click', joinLobbyClick);
    });

    socket.on('playerLeftLobby', function (data) {
        $('#chat').append('<li class="chatmessage">' + data.name
            + '&nbsp;&nbsp;Left the lobby</li>');
    });

    socket.on('playerJoinedLobby', function (data) {
        $('#chat').append('<li class="chatmessage">' + data.name
            + '&nbsp;&nbsp;Joined the lobby</li>');
    });

    socket.on('pushPlayers', function (data) {
        $('#players').empty();
        data.forEach(function (item, index) {
            $('#players').append('<li class="player">' + item.name + '</li>');
        });
    });


    //Error-Handling

    socket.on('errorMessage', function (data) {
        alert(data.message);
    });
}