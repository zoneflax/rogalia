"use strict";
function lobbyStage(data) {
    if (data) {
        game.login = data.Login;
        document.getElementById("version").textContent =  data.Version;
        lobbyStage.metadataVersion = data.MetadataVersion;
    }

    util.ajax("news/" + game.lang + ".html", function(warn) {
        if (!warn) {
            return;
        }

        var panel = new Panel("news", "News");
        panel.temporary = true;
        panel.contents.innerHTML = warn;

        var title = panel.element.querySelector("h2").textContent;
        var icon = document.getElementById("news-icon");
        dom.show(icon);
        icon.onclick = function() {
            localStorage.setItem("news.title", title);
            panel.toggle();
            icon.classList.remove("breaking-news");
        };

        if (title != localStorage.getItem("news.title")) {
            icon.classList.add("breaking-news");
        }
    });

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
            game.playerName = info.Name;
            game.setStage("loading", lobbyStage.metadataVersion);
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
        dom.wrap("lobby-account", game.login),
        dom.hr(),
        avatars,
    ];

    if (!game.inVK()) {
        contents.push(dom.hr());
        contents.push(dom.button(T("Back"), "", function() {
            lobbyStage.characters = [];
            game.clearServerInfo();
            game.network.disconnect();
            game.setStage("selectServer");
        }));
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
};
Stage.add(lobbyStage);
