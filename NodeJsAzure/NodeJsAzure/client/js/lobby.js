var socket = io('/');
socket.on('connect', function () { });
socket.on('event', function (data) { });
socket.on('disconnect', function () { });

var lobby = undefined;
var playerName = "";


var joinLobbyClick = function (event) {
    if (lobby != undefined) {
        socket.emit('leaveLobby');
        $('#chat').append('<li class="chatmessage">You left lobby ' + lobby.name + '</li>');
    }
    socket.emit('joinLobby', { name: $(event.target).html() });
};


window.onload = initLobby;

function initLobby() {

    playerName = prompt('Please enter your PlayerName:');
    socket.emit('playerName', { name: playerName });
    $('#lobbies').empty();

    $('#joingame').click(function () {
        socket.emit('joinGame', undefined);
    });

    $('#createlobby').click(function () {
        if (lobby != undefined) {
            socket.emit('leaveLobby');
            $('#chat').append('<li class="chatmessage">You left lobby ' + lobby.name + '</li>');
        }
        socket.emit('createLobby', { name: $('#lobby').val() });
    });

    socket.emit('getLobbys');

    socket.on('chatMessage', function (data) {
        $('#chat').append('<li class="chatmessage"><strong>' + data.name
            + '</strong>:&nbsp;&nbsp; ' + data.message + '</li>');
    });

    $('#sendchatmessage').click(function () {
        socket.emit('chatMessage', { name: playerName, message: $('#chatmessage').val() });
        $('#chat').append('<li class="chatmessage"><strong>' + playerName
            + '</strong>:&nbsp;&nbsp; ' + $('#chatmessage').val() + '</li>');
        $('#chatmessage').val('');
    });

    socket.on('lobbyJoined', function (data) {
        lobby = data;
        $('#chat').append('<li class="chatmessage">You joined lobby ' + lobby.name + '</li>');
    });

    socket.on('errorMessage', function (data) {
        alert(data.message);
    });

    socket.on('lobbyCreated', function (data) {
        $('#lobbies').append('<li class="curlob"><strong class="lobby">' + data.name + '</strong></li>');
        $('.lobby').unbind('click', joinLobbyClick);
        $('.lobby').bind('click', joinLobbyClick);
        lobby = data;
        $('#chat').append('<li class="chatmessage">You created lobby ' + lobby.name + '</li>');
    });

    socket.on('pushLobbys', function (data) {
        $('#lobbies').empty();
        data.forEach(function (item, index) {
            $('#lobbies').append('<li class="curlob"><strong class="lobby">' + item.name + '</strong></li>');
        });
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
}