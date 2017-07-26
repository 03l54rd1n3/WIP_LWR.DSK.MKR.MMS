using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
namespace WebSockets
{
    public class MessageHub : Hub
    {
        static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();
        static Dictionary<string, string> playernames = new Dictionary<string, string>();
        public void CreateLobby(string name)
        {
            if (name != null)
            {
                if (!lobbies.ContainsKey(name) || lobbies[name].Clients.Count == 0)
                {
                    lobbies[name] = new Lobby();
                    lobbies[name].Clients.Add(Context.ConnectionId);
                    Clients.Client(Context.ConnectionId).LobbyCreated(name);
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

        public void LeaveLobby(string lobby)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];
                l.Clients.Remove(Context.ConnectionId);
                for (int i = 0; i < l.Clients.Count; i++)
                {
                    string key = l.Clients[i];
                    if (key != Context.ConnectionId)
                    {
                        try
                        {
                            Clients.Client(key).PlayerJoined(Context.ConnectionId, playernames[Context.ConnectionId]);
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    Clients.Client(key).UpdateLobbies();
                }
            }
            else
            {
                Clients.Client(Context.ConnectionId).LobbyJoinFailed("Lobby does not exist");
            }
        }

        public void GetLobbies()
        {
            foreach(string lobby in lobbies.Keys)
            {
                Lobby l = lobbies[lobby];
                if (l.Clients.Count > 0)
                {
                    Clients.Client(Context.ConnectionId).Lobby(lobby, l.Clients.Count);
                }
            }
        }


        public void JoinLobby(string lobby)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];
                l.Clients.Add(Context.ConnectionId);
                for (int i = 0; i < l.Clients.Count; i++)
                {
                    string key = l.Clients[i];
                    if (key != Context.ConnectionId)
                    {
                        try
                        {
                            Clients.Client(key).PlayerJoined(Context.ConnectionId, playernames[Context.ConnectionId]);
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    Clients.Client(key).UpdateLobbies();
                }
            }
            else
            {
                Clients.Client(Context.ConnectionId).LobbyJoinFailed("Lobby does not exist");
            }
        }
    }
}