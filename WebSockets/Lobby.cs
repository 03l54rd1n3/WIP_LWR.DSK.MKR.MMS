using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebSockets
{
    public class Lobby
    {
        public string name;
        public string host = null;
        public List<string> Clients = new List<string>();

        public static explicit operator LobbyInfo(Lobby b)  // explicit byte to digit conversion operator
        {
            LobbyInfo info = new LobbyInfo();
            info.name = b.name;
            info.players = b.Clients.Count;
            return info;
        }
    }
    public class LobbyInfo
    {
        public string name;
        public int players;
    }
}