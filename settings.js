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
        "settings.ui.showDonate": function() {
            game.controller.donate.toggle();
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
                var value = localStorage.getItem(key);
                if (value !== null) {
                    group[prop] = JSON.parse(value);
                }
                input.checked = group[prop];
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
