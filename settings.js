function Settings() {
    var sections = [this.makeSettingsSubTree(game.config, "Config")];

    if (game.player.IsAdmin)
        sections.push(this.makeSettingsSubTree(game.debug, "Debug"));

    this.panel = new Panel(
        "settings",
        "Settings",
        sections
    );


    this.triggers = {
        "settings.character.bald": function() {
            game.player.initSprite();
        },
        "settings.language.Russian": function() {
            game.reload();
        },
        "settings.ui.minimapObjects": function() {
            game.reload();
        },
        "settings.map.darkness": function() {

        },
        "settings.sound.playMusic": function() {
            game.sound.toggleMusic();
        },
        "settings.ui.world": function() {
            util.dom.toggle(game.world);
        },
        "settings.graphics.low": function() {
            game.reload();
        },

        "settings.gameplay.pathfinding": function() {
            game.player.Settings.Pathfinding = !game.player.Settings.Pathfinding;
            game.network.send("set-settings", {Settings: game.player.Settings});
        },
    };
}

Settings.load = function() {
    Settings.prototype.makeSettingsSubTree(game.config);
    Settings.prototype.makeSettingsSubTree(game.debug);
}


Settings.prototype = {
    triggers: null,
    makeSettingsSubTree: function(map, name) {
        var self = this;
        var subtree  = document.createElement("div");
        var title = document.createElement("big");
        title.textContent = name;
        subtree.appendChild(title);
        Object.keys(map).forEach(function(name) {
            var group = map[name];

            var fieldset = document.createElement("fieldset");
            var legend = document.createElement("legend");
            legend.textContent = name;
            fieldset.appendChild(legend);

            Object.keys(group).forEach(function(prop) {
                var label = document.createElement("label");
                var input = document.createElement("input");
                input.type = "checkbox";

                var key = ["settings", name, prop].join(".");

                var value = group[prop];
                if (value instanceof Function) {
                    if (game.player) // eval only when player is loaded
                        value = value();
                    else
                        value = false;
                } else {
                    var saved = localStorage.getItem(key);
                    if (saved !== null) {
                        value = JSON.parse(saved);
                        group[prop] = value;
                    }
                }

                input.checked = value
                label.appendChild(input);
                label.appendChild(document.createTextNode(prop));
                fieldset.appendChild(label);

                label.addEventListener("change", function() {
                    group[prop] = !group[prop];
                    localStorage.setItem(key, group[prop]);
                    self.triggers[key] && self.triggers[key]();
                });
            });
            subtree.appendChild(fieldset);
        });
        return subtree;
    },
}
