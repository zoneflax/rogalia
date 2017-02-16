/* global game, util, Panel, dom, loader, Character, Stage */

"use strict";
function lobbyStage(data) {
    if (data) {
        game.setLogin(data.Email || data.Login);
        document.getElementById("version").textContent =  data.Version;
        lobbyStage.metadataVersion = data.MetadataVersion;
    }

    // loadNews();

    var characters = (data && data.Characters) || lobbyStage.characters || [];
    var maxChars = 4;
    // we need to save it because we may return to this stage after
    // createCharacter stage (back button)
    lobbyStage.characters = characters;

    var avatars = dom.div("avatars");

    function add({name, karma, avatar}, callback) {
        var nameElem = dom.wrap("avatar-name", (name == "+") ? T("Create") : name);
        if (karma < 0) {
            nameElem.className += " avatar-pk";
        }

        dom.append(avatars, dom.wrap(
            "avatar-container avatar-non-player",
            [
                dom.wrap("avatar",  avatar),
                nameElem,
            ],
            {onclick: callback}
        ));
    }

    characters = characters.sort(function(a, b) {
        return a.Name > b.Name;
    });

    characters.forEach(function(info) {
        const avatar = Character.makeAvatar(Character.sex(info.Sex), info.Hairstyle);
        add({name:  info.Name, karma: info.Karma, avatar}, function() {
            game.playerName = info.Name;
            game.setStage("loading", lobbyStage.metadataVersion);
        });
    });

    for (var i = maxChars - characters.length; i > 0; i--) {
        var create = loader.loadImage("characters/avatars/new.png", true);
        create.className = "create";
        add({name: T("Create"), avatar: create}, function() {
            game.setStage("createCharacter");
        });
    };

    var contents = [
        dom.wrap("lobby-account",  game.getLogin()),
        avatars,
    ];

    if (!game.inVK()) {
        contents.push(dom.button(T("Back"), "", function() {
            lobbyStage.characters = [];
            game.clearServerInfo();
            game.network.disconnect();
            game.setStage("selectServer");
        }));
    }

    var panel = new Panel("lobby", "", contents).hideCloseButton().show().center(0.5, 0.05);

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

    function loadNews() {
        util.ajax("news/" + game.lang + ".html", function(html) {
            if (!html) {
                return;
            }

            var panel = new Panel("news", "News");
            panel.temporary = true;
            panel.contents.innerHTML = html;

            var pic = panel.element.querySelector(".news-pic");
            if (pic) {
                pic.onclick = function() {
                    new Panel("news-pic", "Image", dom.img("news/update-full.png")).show();
                };
            }

            var title = panel.element.querySelector("h2").textContent;
            var icon = document.getElementById("news-icon");
            dom.show(icon);
            icon.onclick = function() {
                gameStorage.setItem("news.title", title);
                panel.toggle();
                icon.classList.remove("breaking-news");
            };

            if (title != gameStorage.getItem("news.title")) {
                icon.classList.add("breaking-news");
            }
        });
    }
};

Stage.add(lobbyStage);
