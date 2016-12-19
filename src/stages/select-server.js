/* global game, dom, Panel, T */

"use strict";

function selectServerStage(panel) {
    var self = this;
    this.panel = panel;
    showServers();

    function showServers() {
        var req = new XMLHttpRequest();
        req.onload = function() {
            if (this.status != 200) {
                game.popup.alert(this.response, quit);
                return;
            }
            var servers = JSON.parse(this.response);
            self.panel = new Panel("select-server", "", [
                dom.wrap("lobby-account", game.getLogin()),
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
        if (game.args["steam"]) {
            var gui = require("nw.gui");
            gui.App.quit();
        } else {
            game.clearCredentials();
            self.panel.close();
            game.setStage("login");
        }
    }

    function serversTable(servers) {
        if (_.size(servers) == 0)
            return dom.make("p", T("All servers are offline"));
        return dom.table(
            [
                T("Server"),
                T("Online"),
                T("Population"),
                T("Description"),
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
                    TS(server.Status),
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
        game.connectAndLogin(server, game.loadSessionToken());
    }

    function openLobby(data) {
        if (data.Warning) {
            game.popup.alert(T(data.Warning), quit);
        } else {
            game.setStage("lobby", data);
        }
    }
}

Stage.add(selectServerStage);
