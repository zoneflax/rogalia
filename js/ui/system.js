"use strict";
function System() {
    this.fps = new FpsStats();

    var fps = dom.wrap("#fps-stats", this.fps.domElement);

    this.ping = dom.span("Ping: -");

    this.users = new Users();
    this.help = new Help();
    this.settings = new Settings();

    var users = dom.button(T("Users"), "", this.users.panel.toggle.bind(this.users.panel));
    var help = dom.button(T("Help"), "", this.help.panel.toggle.bind(this.help.panel));
    var settings = dom.button(T("Settings"),"", this.settings.panel.toggle.bind(this.settings.panel));

    var links = dom.button(T("Links"));
    links.onclick = function() {
        new Panel("links", "", [
            // game.button.forum(),
            game.button.blog(),
            game.button.vk(),
            game.button.twitter(),
            game.button.authors(),
        ]).show();
    };

    this.panel = new Panel(
        "system",
        "System",
        [
            fps,
            this.ping,
            dom.hr(),
            settings,
            // help,
            users,
            dom.hr(),
            game.button.wiki(),
            // game.button.bugtracker(),
            dom.hr(),
            links,
            game.button.donate(),
            dom.hr(),
            game.button.lobby(),
            game.button.logout(),
        ]
    );
}
