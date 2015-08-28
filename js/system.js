"use strict";
function System() {
    this.fps = new FpsStats();

    var fps = document.createElement("div");
    fps.id = "fps-stats";
    fps.appendChild(this.fps.domElement);

    this.ping = document.createElement("span");
    this.ping.textContent = "Ping: -";

    this.users = new Users();
    this.help = new Help();
    this.settings = new Settings();

    var users = document.createElement("button");
    users.textContent = T("Users");
    users.onclick = this.users.panel.toggle.bind(this.users.panel);

    var help = document.createElement("button");
    help.textContent = T("Help");
    help.onclick = this.help.panel.toggle.bind(this.help.panel);

    var donate = document.createElement("button");
    donate.textContent = T("Donate");
    donate.onclick = function() {
        new Donate();
    };

    var settings = document.createElement("button");
    settings.textContent = T("Settings");
    settings.onclick = this.settings.panel.toggle.bind(this.settings.panel);

    this.panel = new Panel(
        "system",
        "System",
        [
            fps,
            this.ping,
            util.hr(),
            settings,
            help,
            users,
            util.hr(),
            game.button.bugtracker(),
            game.button.wiki(),
            game.button.forum(),
            game.button.blog(),
            game.button.vk(),
            game.button.twitter(),
            game.button.authors(),
            donate,
            util.hr(),
            game.button.lobby(),
            game.button.logout(),
        ]
    );
}
