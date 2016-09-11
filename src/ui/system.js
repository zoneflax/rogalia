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
            game.button.donate(),
            dom.hr(),
            game.button.lobby(),
            dom.button(T("Logout"), "", function() {
                document.location.reload();
            }),
        ]
    );
}
