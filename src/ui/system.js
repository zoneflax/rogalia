/* global game, dom, T, Panel, FpsStats, Users, Settings */

"use strict";

function System() {
    var self = this;
    this.fps = new FpsStats();

    var fps = dom.wrap("#fps-stats", this.fps.domElement);

    this.ping = dom.span("Ping: -");

    this.users = new Users();
    this.settings = new Settings();

    var users = dom.button(T("Users"), "", this.users.panel.toggle.bind(this.users.panel));
    var settings = dom.button(T("Settings"),"", this.settings.panel.toggle.bind(this.settings.panel));

    var links = dom.button(T("Links"));
    links.onclick = function() {
        new Panel("links", "", [
            game.button.forum(),
            game.button.blog(),
            game.button.vk(),
            game.button.twitter(),
            game.button.authors(),
        ]).show();
    };

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
            dom.hr(),
            links,
            !game.args["steam"] && game.button.donate(),
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
