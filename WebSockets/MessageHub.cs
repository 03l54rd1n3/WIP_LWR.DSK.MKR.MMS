using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
namespace WebSockets
{
    public class MessageHub : Hub
    {
        static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();
        static Dictionary<string, string> playernames = new Dictionary<string, string>();

        public void Quit()
        {
            foreach (string lobby in lobbies.Keys)
            {
                LeaveLobby(lobby);
                if (playernames.ContainsKey(Context.ConnectionId))
                    playernames.Remove(Context.ConnectionId);
            }
        }
        public void CreateLobby(string name)
        {
            if (name != null)
            {
                if (!lobbies.ContainsKey(name) || lobbies[name].Clients.Count == 0)
                {
                    lobbies[name] = new Lobby();
                    lobbies[name].name = name;
                    Clients.Client(Context.ConnectionId).LobbyCreated(name);
                    JoinLobby(name);
                }
                else
                {
                    Clients.Client(Context.ConnectionId).LobbyCreationFailed("Lobby exists");
                }
            }
            else
            {
                Clients.Client(Context.ConnectionId).LobbyCreationFailed("Lobby name is null");
            }
            Clients.All.UpdateLobbies();
        }

        public void Connect(string name)
        {
            playernames[Context.ConnectionId] = name;
        }

        public void UpdatePosition(string lobby, int x, int y)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];
                for (int i = 0; i < l.Clients.Count; i++)
                {
                    string key = l.Clients[i];
                    if (key != Context.ConnectionId)
                    {
                        try
                        {
                            Clients.Client(key).UpdatePosition(key, x, y);
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                }
            }
        }

        public void ChatMessage(string lobby, string message)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];

                for (int i = 0; i < l.Clients.Count; i++)
                {
                    string key = l.Clients[i];
                    try
                    {
                        Clients.Client(key).ChatMessage(playernames[Context.ConnectionId], message);
                    }
                    catch (Exception ex)
                    {

                    }
                }
            }
            else
            {
                Clients.Client(Context.ConnectionId).LobbyJoinFailed("Lobby does not exist");
            }
        }



        public void LeaveLobby(string lobby)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];
                if (l.Clients.Contains(Context.ConnectionId))
                {
                    l.Clients.Remove(Context.ConnectionId);
                    Clients.Client(Context.ConnectionId).ChatMessage("Server", "You left lobby " + lobby);
                    for (int i = 0; i < l.Clients.Count; i++)
                    {
                        string key = l.Clients[i];
                        if (key != Context.ConnectionId)
                        {
                            try
                            {
                                Clients.Client(key).PlayerLeft(playernames[Context.ConnectionId]);
                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }
                    Clients.All.UpdateLobbies();
                }
            }
            else
            {
                Clients.Client(Context.ConnectionId).LobbyJoinFailed("Lobby does not exist");
            }
        }

        public void GetLobbies()
        {
            List<LobbyInfo> lobbyInfos = new List<LobbyInfo>();
            foreach (string lobby in lobbies.Keys)
            {
                Lobby l = lobbies[lobby];
                lobbyInfos.Add((LobbyInfo)l);
            }
            Clients.Client(Context.ConnectionId).Lobby(lobbyInfos.ToArray());
        }

        public void GetPlayers(string lobby)
        {
            if (lobby != null)
                if (lobbies.ContainsKey(lobby))
                {
                    List<string> players = new List<string>();
                    Lobby l = lobbies[lobby];
                    for (int i = 0; i < l.Clients.Count; i++)
                    {
                        players.Add(playernames[l.Clients[i]]);
                    }
                    Clients.Client(Context.ConnectionId).Players(players.ToArray());
                }
                else
                {
                    Clients.Client(Context.ConnectionId).LobbyJoinFailed("Lobby does not exist");
                }
        }


        public void JoinLobby(string lobby)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];
                if (!l.Clients.Contains(Context.ConnectionId))
                {
                    foreach (string lobbyName in lobbies.Keys)
                    {
                        LeaveLobby(lobbyName);
                    }
                    l.Clients.Add(Context.ConnectionId);
                    Clients.Client(Context.ConnectionId).ChatMessage("Server", "You joined lobby" + lobby);
                    Clients.Client(Context.ConnectionId).LobbyJoined(lobby);
                    for (int i = 0; i < l.Clients.Count; i++)
                    {
                        string key = l.Clients[i];
                        if (key != Context.ConnectionId)
                        {
                            try
                            {
                                Clients.Client(key).PlayerJoined(playernames[Context.ConnectionId]);
                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }
                    Clients.All.UpdateLobbies();
                }
                else
                {
                    Clients.Client(Context.ConnectionId).LobbyJoinFailed("Lobby already joined");
                }
            }
            else
            {
                Clients.Client(Context.ConnectionId).LobbyJoinFailed("Lobby does not exist");
            }
        }
    }
}