"use strict";
function lobbyStage(data) {
    var account = document.createElement("div");
    account.className = "lobby-account";
    account.textContent = game.login;

    var characters = (data && data.Characters) || lobbyStage.characters || [];
    var maxChars = 4;
    while (characters.length < maxChars) {
        characters.push("+");
    }
    // we need to save it because we may return to this stage after
    // createCharacter stage (back button)
    lobbyStage.characters = characters;

    var avatars = document.createElement("div");

    characters.forEach(function(name) {
        var avatarContainer = document.createElement("div");
        avatarContainer.className = "avatar-container";
        //TODO: use character sex or avatar from server
        var avatar = document.createElement("div");
        avatar.className = "avatar";

        if (name == "+") {
            var create = loader.loadImage("avatars/new.png").cloneNode();
            create.className = "create";
            avatar.appendChild(create);
            avatarContainer.onclick = function() {
                game.setStage("createCharacter");
            };
        } else {
            var sex = "male";
            avatar.appendChild(loader.loadImage("avatars/" + sex + ".png").cloneNode());
            avatarContainer.onclick = function() {
                game.player.Name = name;
                game.network.send("enter", {Name: name, Version: game.version});
            };
        }


        var nameElem = document.createElement("div");
        nameElem.className = "avatar-name";
        nameElem.textContent = (name == "+") ? T("Create") : name;

        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(nameElem);

        avatars.appendChild(avatarContainer);
    });

    var quit = document.createElement("button");
    quit.textContent = T("Quit");
    quit.onclick = function() {
        lobbyStage.characters = [];
        game.clearCredentials();
        game.setStage("login");
    };

    var panel = new Panel("lobby", "", [
        account,
        util.hr(),
        avatars,
        util.hr(),
        quit,
    ]);
    panel.hideCloseButton();
    panel.show(LOBBY_X + game.offset.x, LOBBY_Y + game.offset.y);

    function fastenter() {
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
        game.setStage("loading", data);
    };
};
Stage.add(lobbyStage);
