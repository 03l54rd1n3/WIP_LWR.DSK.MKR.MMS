using Microsoft.Owin;
using Owin;
[assembly: OwinStartup(typeof(WebSockets.AppStartup))]
namespace WebSockets
{
    public class AppStartup
    {
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}