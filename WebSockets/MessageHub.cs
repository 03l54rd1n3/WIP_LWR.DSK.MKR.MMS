using System;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using System.Drawing;
namespace WebSockets
{
    public class MessageHub : Hub
    {
        static Dictionary<string, Lobby> lobbies = new Dictionary<string, Lobby>();
        static Dictionary<string, string> playernames = new Dictionary<string, string>();
        static Dictionary<string, Point> playerPos = new Dictionary<string, Point>();
        static Dictionary<string, int[,]> lobbyFields = new Dictionary<string, int[,]>();
        public void Quit()
        {
            foreach (string lobby in lobbies.Keys)
            {
                LeaveLobby(lobby);
                if (playernames.ContainsKey(Context.ConnectionId))
                    playernames.Remove(Context.ConnectionId);
            }
        }

        public void MoveObject(string lobby, dynamic oldPoint, dynamic newPoint)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];
                int[,] obj = lobbyFields[lobby];
                if (oldPoint.X == -1 || oldPoint.Y == -1)
                { }
                else
                {
                    lobbyFields[lobby][newPoint.X, newPoint.Y] = lobbyFields[lobby][oldPoint.X, oldPoint.Y];
                    lobbyFields[lobby][newPoint.X, newPoint.Y] = -1;
                    for (int i = 0; i < l.Clients.Count; i++)
                    {
                        string key = l.Clients[i];
                        if (key != Context.ConnectionId)
                        {
                            try
                            {
                                if (playerPos[key] != null)
                                {
                                    Clients.Client(key).MoveObject(oldPoint, newPoint);
                                }
                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }
                }
            }
        }

        public void CreateObject(string lobby, int blockType, dynamic newPoint)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];

                lobbyFields[lobby][newPoint.X, newPoint.Y] = blockType;
                for (int i = 0; i < l.Clients.Count; i++)
                {
                    string key = l.Clients[i];
                    if (key != Context.ConnectionId)
                    {
                        try
                        {
                            if (playerPos[key] != null)
                            {
                                Clients.Client(key).CreateObject(blockType, newPoint);
                            }
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                }
            }
        }

        public void RequestSecondInit()
        {
            Clients.Client(Context.ConnectionId).SecondInit();
        }


        public void RequestHostParams(string lobby)
        {
            if (lobbies.ContainsKey(lobby))
            {
                Lobby l = lobbies[lobby];
                if (l.host == null)
                    l.host = Context.ConnectionId;
                Clients.Client(Context.ConnectionId).HostParams(l.host == Context.ConnectionId);
            }
        }

        public void RequestGameField(string lobby)
        {
            if (lobbies.ContainsKey(lobby))
            {
                for (int x = 0; x < 40; x++)
                    for (int y = 0; y < 17; y++)
                        Clients.Client(Context.ConnectionId).CreateObject(lobbyFields[lobby][x, y], x, y);
                if (lobbies[lobby].host != Context.ConnectionId)
                    Clients.Client(Context.ConnectionId).SecondInit();
            }
        }


        public void DestroyObject(string lobby, dynamic point)
        {
            if (point != null)
                if (lobbies.ContainsKey(lobby))
                {
                    Lobby l = lobbies[lobby];
                    lobbyFields[lobby][point.X, point.Y] = -1;
                    for (int i = 0; i < l.Clients.Count; i++)
                    {
                        string key = l.Clients[i];
                        if (key != Context.ConnectionId)
                        {
                            try
                            {
                                if (playerPos[key] != null)
                                {
                                    Clients.Client(key).DestroyObject(point);
                                }
                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }
                }
        }



        public void JoinGame(string lobby)
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
                            Clients.Client(key).GameJoined(playernames[Context.ConnectionId], Context.ConnectionId);
                            if (playerPos[key] != null)
                            {
                                Clients.Client(Context.ConnectionId).GameJoined(playernames[key], key);
                                Clients.Client(Context.ConnectionId).UpdatePosition(key, playerPos[key].X, playerPos[key].Y);
                            }
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                }
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
                    if (!lobbyFields.ContainsKey(name))
                    {
                        int[,] field = new int[40, 17];
                        for (int x = 0; x < 40; x++)
                            for (int y = 0; y < 17; y++)
                                field[x, y] = -1;
                        lobbyFields[name] = field;
                    }
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
            if (lobby != null)
                if (lobbies.ContainsKey(lobby))
                {
                    Lobby l = lobbies[lobby];
                    playerPos[Context.ConnectionId] = new Point(x, y);
                    for (int i = 0; i < l.Clients.Count; i++)
                    {
                        string key = l.Clients[i];
                        if (key != Context.ConnectionId)
                        {
                            try
                            {
                                Clients.Client(key).UpdatePosition(Context.ConnectionId, x, y);
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
            if (lobby != null)
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
                    Clients.Client(Context.ConnectionId).ChatMessage("Server", "You joined lobby " + lobby);
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