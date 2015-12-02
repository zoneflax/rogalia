"use strict";
function Users() {
    var lists = {};

    function append(name, list) {
        var li = dom.tag("li", "", {text: name});
        li.onmousedown = function(e) {
            return game.chat.nameMenu(e, name);
        };
        list.appendChild(li);
    }

    function render(content, data, selector, empty) {
        content.innerHTML = "";
        var ul = dom.tag("ul");
        lists[selector] = ul;
        content.appendChild(ul);
        if (!data[selector]) {
            content.textContent = T(empty);
        } else {
            data[selector].sort().forEach(function(name) {
                append(name, ul);
            });
            var total = dom.div("", {text: T("Total") + ": " + data[selector].length});
            content.appendChild(total);
        }
    }

    function makeTabUpdate(cmd, selector, empty) {
        return function (title, content) {
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

    this.tabs = dom.tabs([
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
        [this.tabs]
    );

    this.updateOnlinePlayersTab = this.tabs.tabs[0].update;
    this.updateFriendsTab = this.tabs.tabs[1].update;
    this.updateBlacklistTab = this.tabs.tabs[2].update;

    this.addPlayer = function(name) {
        if (name == game.player.Name)
            return;
        var list = lists.OnlinePlayers;
        if (list)
            append(name, list);
    };

    this.removePlayer = function(name) {
        if (name == game.player.Name)
            return;
        var list = lists.OnlinePlayers;
        if (list) {
            var item = Array.prototype.find.call(list.children, function(node) {
                return node.textContent == name;
            });
            // item must be always in the list, but just in case
            if (item)
                dom.remove(item);
        }
    };
}
