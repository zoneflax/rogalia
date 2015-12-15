"use strict";
function Minimap() {
    var width = {
        default: 300,
        original: 0,
        current: 0,
    };
    var scale = function() {
        return width.current / width.original;
    };

    var loader = new Loader(window.location.protocol + "//" + game.network.addr);
    this.mapImage = loader.loadImage("/map");
    loader.ready(function() {
        width.original = this.mapImage.width;
        width.current = width.default;
        this.mapImage.width = width.default;
    }.bind(this));
    this.points = {};
    this.characters = [];

    var wrapper = document.createElement("div");
    wrapper.className = "wrapper no-drag";
    wrapper.appendChild(this.mapImage);

    var lvl = 0;
    var zoom = document.createElement("button");
    zoom.textContent = T("Zoom");
    zoom.onclick = function() {
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
        this.mapImage.width = width.current;
    }.bind(this);

    this.mapImage.onclick = function(e) {
        if (!game.player.IsAdmin)
            return;
        var rect = e.target.getBoundingClientRect();
        var x = e.pageX - rect.left;
        var y = e.pageY - rect.top;
        game.network.send(
            "teleport",
            {"x": x / scale() * CELL_SIZE, "y": y / scale() * CELL_SIZE}
        );
    };

    this.panel = new Panel(
        "map",
        "Map",
        [wrapper, zoom]
    );

    this.sync = function(data) {
        data = data || {};
        var pl = game.player;
        data[pl.Name] = {X: pl.X, Y: pl.Y};
        this.characters = data;
        for (var name in this.points) {
            if (name in data && data[name] == null) {
                dom.remove(this.points[name]);
                delete this.characters[name];
                delete this.points[name];
            }
        }

        if (this.panel.visible)
            this.update();
    };

    this.update = function() {
        if (!this.panel.visible)
            return;
        for (var name in this.characters) {
            var character = this.characters[name];
            var x = character.X / CELL_SIZE;
            var y = character.Y / CELL_SIZE;
            var point = this.points[name];
            if (!point) {
                point = dom.div("point");
                point.title = name;


                if (name == game.player.Name) {
                    point.id = "player-point";
                } else if (character.Karma < 0) {
                    point.classList.add("pk");
                    point.title += " | " + T("Karma") + ": " + character.Karma;
                }

                this.points[name] = point;
                wrapper.appendChild(point);
            }
            point.style.left = scale() * x + "px";
            point.style.top = scale() * y + "px";
        }
    };

    this.panel.hooks.show = this.update.bind(this);
}
