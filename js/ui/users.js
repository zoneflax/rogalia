"use strict";
function Users() {
    this.characters = [];
    this.listElement = document.createElement("ul");
    var total = document.createElement("div");

    var tabs = dom.tabs([
        {
            title: T("Users online"),
            contents: [this.listElement, total]
        },
        {
            title: T("Friends"),
            update: function() {
                var tabContent = this;
                tabContent.innerHTML = "";
                var list = dom.tag("ul");
                tabContent.appendChild(list);
                game.network.send("friend-list", {}, function(data) {
                    if (!data.Friends)
                        tabContent.textContent = T("No friends");
                    else
                        data.Friends.forEach(function(name) {
                            var friend = dom.tag("li", "friend", {text: name});
                            friend.onmousedown = function(e) {
                                return game.chat.nameMenu(e, name);
                            };
                            list.appendChild(friend);
                        });
                });
            }
        }
    ]);
    this.panel = new Panel(
        "users",
        "Users",
        [tabs]
    );

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
