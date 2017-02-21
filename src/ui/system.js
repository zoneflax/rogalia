/* global game, dom, T, Panel, FpsStats, Users, Settings, Profile */

"use strict";

function System() {
    this.fps = new FpsStats();

    this.fps.domElement.id = "fps-stats-graph";
    const fps = dom.wrap("#fps-stats", this.fps.domElement);

    this.ping = dom.wrap("#ping-stats", "Ping: -");

    this.users = new Users();
    this.settings = new Settings();
    this.profile = new Profile();

    const users = dom.button(T("Users"), "", () => this.users.panel.toggle());
    const settings = dom.button(T("Settings"), "", () => this.settings.panel.toggle());
    const profile = dom.button(T("Profile"), "", () => this.profile.panel.toggle());

    this.update = function(ping) {
        this.ping.textContent = "Ping: " + ping + "ms";
    };

    this.panel = new Panel(
        "system",
        "System",
        [
            fps,
            this.ping,
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
