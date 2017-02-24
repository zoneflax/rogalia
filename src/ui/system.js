/* global game, dom, T, Panel, FpsStats, Users, Settings, Profile */

"use strict";

function System() {
    this.fps = new FpsStats();

    this.fps.domElement.id = "fps-stats-graph";
    const fps = dom.wrap("#fps-stats", this.fps.domElement);

    this.ping = dom.div("#ping");

    this.users = new Users();
    this.settings = new Settings();
    this.profile = new Profile();

    const users = dom.button(T("Users"), "", () => this.users.panel.toggle());
    const settings = dom.button(T("Settings"), "", () => this.settings.panel.toggle());
    const profile = dom.button(T("Profile"), "", () => this.profile.panel.toggle());

    this.update = function(ping) {
        if (game.player.IsAdmin) {
            this.ping.textContent = ping;
        }
        if (ping < 100)
            this.ping.style.backgroundColor = "#03ce03";
        else if (ping < 200)
            this.ping.style.backgroundColor = "#0f980f";
        else if (ping < 300)
            this.ping.style.backgroundColor = "#dcb809";
        else
            this.ping.style.backgroundColor = "#d40a0a";
    };

    this.panel = new Panel(
        "system",
        "System",
        [
            fps,
            dom.wrap("#ping-stats", [
                "Ping: ",
                this.ping
            ]),
            dom.hr(),
            settings,
            users,
            profile,
            dom.hr(),
            game.args["steam"] ?
                dom.button(T("Change character"), "", game.reload)
                : game.button.lobby(),
            game.args["steam"] ?
                dom.button(T("Quit"), "", () => game.quit())
                : dom.button(T("Logout"), "", game.reload),
        ]
    );
}
