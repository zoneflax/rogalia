"use strict";
function Users() {
    function render(content, data, selector, empty) {
        content.innerHTML = "";
        var ul = dom.tag("ul");
        content.appendChild(ul);
        if (!data[selector]) {
            content.textContent = T(empty);
        } else {
            data[selector].forEach(function(name) {
                var li = dom.tag("li", "", {text: name});
                li.onmousedown = function(e) {
                    return game.chat.nameMenu(e, name);
                };
                ul.appendChild(li);
            });
            var total = dom.div("", {text: T("Total") + ":" + data[selector].length});
            content.appendChild(total);
        }
    }

    function makeTabUpdate(cmd, selector, empty) {
        return function(title, content) {
            function update(data) {
                render(content, data, selector, empty);
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
            title: T("Online players"),
            update: makeTabUpdate("player-list", "OnlinePlayers", "")
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

    this.updateOnlinePlayersTab = tabs.tabs[0].update;
    this.updateFriendsTab = tabs.tabs[1].update;
    this.updateBlacklistTab = tabs.tabs[2].update;

    this.removePlayer = function(name) {
        //TODO
    };

    this.addPlayer = function(name) {
        //TODO
    };
}
