/* global game, Image, dom */

"use strict";
function Minimap() {
    var self = this;
    var width = {
        default: 300,
        original: 0,
        current: 0,
    };
    function scale() {
        return width.current / width.original;
    };

    this.mapImage = new Image();
    this.mapImage.onload = function() {
        width.original = self.mapImage.width;
        width.current = width.default;
        self.mapImage.width = width.default;
        loadMarkers();
    };

    this.mapImage.src = game.proto() + "//" + game.network.addr + "/map";

    this.points = {};
    this.markers = {};
    this.characters = [];

    var wrapper = dom.wrap("wrapper", this.mapImage);

    var lvl = 0;
    var zoom = dom.button(T("Zoom"), "", function() {
        switch (lvl++) {
        case 0:
            width.current *= 2;
            break;
        case 1:
            wrapper.classList.add("zoom");
            width.current = width.original;
            break;
        case 2:
            width.current = width.default;
            wrapper.classList.remove("zoom");
            lvl = 0;
            break;
        }
        self.rescale();
        self.mapImage.width = width.current;
    });

    function pointFromEvent(e) {
        var rect = e.target.getBoundingClientRect();
        return new Point(e.pageX - rect.left, e.pageY - rect.top).div(scale()).round();
    }

    this.mapImage.onclick = function(e) {
        if (game.controller.modifier.alt && game.player.IsAdmin) {
            var p = pointFromEvent(e).mul(CELL_SIZE);
            game.network.send("teleport", p.json());
            return;
        }
        var p = pointFromEvent(e);
        var point = this.addMarker(p.x, p.y);
        if (game.controller.modifier.shift)
            sendPoint(point);
    }.bind(this);

    this.panel = new Panel(
        "map",
        "Map",
        [wrapper, zoom]
    );

    this.save = function() {
        saveMarkers();
    };

    this.sync = function(data) {
        data = data || {};
        this.characters = data;
        var pl = game.player;
        this.characters[pl.Name] = {X: pl.X, Y: pl.Y};
        for (var name in this.points) {
            if (name in data && data[name] == null) {
                delete this.characters[name];
                removePointByName(name);
            }
        }

        if (this.panel.visible)
            this.update();
    };

    function addMarker(point) {
        self.markers[point.name] = point;
    }

    function saveMarkers() {
        var markers = _.map(self.markers, function(point) {
            return {
                x: point.x,
                y: point.y,
                title: point.title,
            };
        });
        localStorage.setItem("map.markers", JSON.stringify(markers));
    };

    function loadMarkers() {
        var markers = localStorage.getItem("map.markers");
        markers &&  _.forEach(JSON.parse(markers), function(point) {
            self.addMarker(point.x, point.y, point.title);
        });
    }

    function makePoint(title) {
        var point = dom.div("point");
        point.title = title;
        return point;
    };

    function addPoint(name, point) {
        self.points[name] = point;
        wrapper.appendChild(point);
    };

    function updatePoint(point, x, y) {
        point.x = x;
        point.y = y;
        point.style.left = scale() * x + "px";
        point.style.top = scale() * y + "px";
    };

    function removePointByName(name) {
        dom.remove(self.points[name]);
        delete self.points[name];
        delete self.markers[name];
    };

    function sendPoint(point) {
        var title = (point.title == point.name) ? "" : " " + point.title;
        game.chat.send("${marker:" + point.x + " " + point.y + title +"}");
    }

    this.rescale = function() {
        for (var name in this.points) {
            var point = this.points[name];
            updatePoint(point, point.x, point.y);
        }
    };

    this.update = function() {
        if (!this.panel.visible)
            return;

        for (var name in this.characters) {
            var character = this.characters[name];
            if (!character)
                continue;
            var x = character.X / CELL_SIZE;
            var y = character.Y / CELL_SIZE;
            var point = this.points[name];
            if (!point) {
                point = makePoint(name);

                if (name == game.playerName) {
                    point.id = "player-point";
                } else if (character.Karma < 0) {
                    point.classList.add("pk");
                    point.title += " | " + T("Karma") + ": " + character.Karma;
                }

                addPoint(name, point);
            }
            updatePoint(point, x, y);
        }
    };

    this.addMarker = function(x, y, title) {
        var name = x + " " + y;
        if (name in this.points)
            return this.points[name];
        var point = makePoint(title || name);
        point.classList.add("marker-point");
        point.name = name;
        addPoint(name, point);
        updatePoint(point, x, y);
        addMarker(point);

        point.onmousedown = function(e) {
            switch (e.button) {
            case game.controller.LMB:
                if (game.controller.modifier.shift) {
                    sendPoint(point);
                } else {
                    e.preventDefault();
                    game.popup.prompt(T("Description") + ":", "", function(title) {
                        point.title = title;
                    });
                }
                break;
            case game.controller.RMB:
                removePointByName(name);
                break;
            }
        };
        return point;
    };

    this.panel.hooks.show = this.update.bind(this);
}
