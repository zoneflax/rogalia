"use strict";

function selectServerStage(panel) {
    var self = this;
    this.panel = panel;
    showServers();

    function showServers() {
        var req = new XMLHttpRequest();
        req.onload = function() {
            if (this.status != 200) {
                game.alert(this.response, quit);
                return;
            }
            var servers = JSON.parse(this.response);
            self.panel = new Panel("select-server", "", [
                dom.wrap("lobby-account", game.login),
                serversTable(servers),
                dom.button(T("Refresh"), "refresh", showServers),
                dom.button(T("Quit"), "quit", quit)
            ]);
            self.panel.hideCloseButton();
            self.panel.show(LOBBY_X + game.offset.x, LOBBY_Y + game.offset.y);
        };
        req.open("GET", game.gateway + "/status", true);
        req.send(null);
    }

    function quit() {
        game.clearCredentials();
        self.panel.close();
        game.setStage("login");
    }

    function serversTable(servers) {
        if (_.size(servers) == 0)
            return dom.make("p", T("All servers are offline"));
        return dom.table(
            [
                T("Server"),
                T("Online"),
                T("Population"),
                T("Desc"),
                T("Status"),
                ""
            ],
            _.map(servers, function(server) {
                var enterButton = dom.button(T("Enter"), "", function() {
                    enter(server);
                });
                if (server.Status != "online")
                    enterButton.disabled = true;
                return [
                    server.Name,
                    sprintf("%d/%d", server.Players.Online, server.Players.Limit),
                    server.Players.Population,
                    server.Desc,
                    server.Status,
                    enterButton,
                ];
            }),
            "servers"
        );
    }

    function enter(server) {
        self.sync = openLobby;
        self.panel.close();
        self.draw = Stage.makeEllipsisDrawer();
        game.connectAndLogin(server);
    }

    function openLobby(data) {
        game.setStage("lobby", data);
    }
}

Stage.add(selectServerStage);
