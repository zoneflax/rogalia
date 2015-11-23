"use strict";
function Users() {
    this.characters = [];
    this.listElement = document.createElement("ul");
    var total = document.createElement("div");

    function makeTabUpdate(cmd, selector, empty) {
        return function(title, content) {
            content.innerHTML = "";
            var list = dom.tag("ul");
            content.appendChild(list);
            function update(data) {
                if (!data[selector])
                    content.textContent = T(empty);
                else
                    data[selector].forEach(function(name) {
                        var li = dom.tag("li", selector.toLowerCase(), {text: name});
                        li.onmousedown = function(e) {
                            return game.chat.nameMenu(e, name);
                        };
                        list.appendChild(li);
                    });
            }
            game.network.send(cmd, {}, update);
            // when e.g. this.updateFriendsTab()  will be called from game.chat
            // we need to chain game.network.send callback
            // so return it
            return update;
        };
    }

    var tabs = dom.tabs([
        {
            title: T("Users online"),
            contents: [this.listElement, total]
        },
        {
            title: T("Friends"),
            update: makeTabUpdate("friend-list", "Friends", "No friends")
        },
        {
            title: T("Blacklist"),
            update: makeTabUpdate("blacklist-list", "Blacklist", "Blacklist is empty")
        }
    ]);

    this.panel = new Panel(
        "users",
        "Users",
        [tabs]
    );

    this.updateFriendsTab = tabs.tabs[1].update;
    this.updateBlacklistTab = tabs.tabs[2].update;

    this.playersList = {};

    this.addCharacter = function(name) {
        var user = this.playersList[name];

        if (!user) {
            user = document.createElement("li");;
            user.href = "javascript://";
            user.textContent = name;
            user.onmousedown = function(e) {
                return game.chat.nameMenu(e, name);
            };

            this.listElement.appendChild(user);
            this.playersList[name] = user;
        }
    };

    this.sync = function(data) {
        if (!data)
            return;
        this.characters = data;
        this.update();
    };

    this.update = function() {
        if (!this.panel.visible)
            return;

        var count = 0;
        for(var name in this.characters) {
            count++;
            this.addCharacter(name);
        }

        for(var name in this.playersList) {
            if (!this.characters[name]) {
                this.playersList[name].parentNode.removeChild(this.playersList[name]);
                delete this.playersList[name];
            }
        }
        total.textContent = T("Total") + ": " + count;
    };

    this.panel.hooks.show = this.update.bind(this);
}
