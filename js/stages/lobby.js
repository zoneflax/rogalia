"use strict";
function lobbyStage(data) {
    var account = document.createElement("div");
    account.className = "lobby-account";
    account.textContent = game.login;

    var characters = (data && data.Characters) || lobbyStage.characters || [];
    var maxChars = 4;
    // we need to save it because we may return to this stage after
    // createCharacter stage (back button)
    lobbyStage.characters = characters;

    var avatars = document.createElement("div");

    function add(name, icon, callback) {
        var avatarContainer = document.createElement("div");
        avatarContainer.className = "avatar-container";

        var avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.appendChild(icon);

        var nameElem = document.createElement("div");
        nameElem.className = "avatar-name";
        nameElem.textContent = (name == "+") ? T("Create") : name;

        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(nameElem);
        avatarContainer.onclick = callback;

        avatars.appendChild(avatarContainer);
    }

    characters = characters.sort(function(a, b) {
        return a.Name > b.Name;
    });

    characters.forEach(function(info) {
        var icon = loader.loadImage("avatars/" + Character.sex(info.Sex) + ".png").cloneNode();
        add(info.Name, icon, function() {
            game.player.Name = info.Name;
            game.network.send("enter", {Name: info.Name, Version: game.version});
        });
    });

    for (var i = maxChars - characters.length; i > 0; i--) {
        var create = loader.loadImage("avatars/new.png").cloneNode();
        create.className = "create";
        add(T("Create"), create, function() {
            game.setStage("createCharacter");
        });
    };

    var contents = [
        account,
        dom.hr(),
        avatars,
    ];

    if (!game.inVK()) {
        var quit = document.createElement("button");
        quit.textContent = T("Quit");
        quit.onclick = function() {
            lobbyStage.characters = [];
            game.clearCredentials();
            game.setStage("login");
        };
        contents.push(dom.hr());
        contents.push(quit);
    }

    var panel = new Panel("lobby", "", contents);
    panel.hideCloseButton();
    panel.show(LOBBY_X + game.offset.x, LOBBY_Y + game.offset.y);

    function fastenter(e) {
        if (e.keyCode != 13) // enter
            return;
        var avatars = document.getElementsByClassName("avatar");
        if (avatars.length > 0)
            avatars[0].click();
    }

    window.addEventListener("keypress", fastenter);

    this.end = function() {
        window.removeEventListener("keypress", fastenter);
        panel.close();
    };
    // first data packet of the loading stage has no ack field
    // so use this.sync instead of network.send callback
    this.sync = function(data) {
        // see bugreport-sent
        if (data.Ack)
            return;
        game.setStage("loading", data);
    };
};
Stage.add(lobbyStage);
