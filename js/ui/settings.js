"use strict";
function Settings() {
    var tabs = this.makeSettingsTabs(game.config, "Config");
    if (game.player.IsAdmin) {
        this.makeSettingsTabs(game.debug, "Debug").forEach(function(tab) {
            tabs.push(tab);
        });
    }
    this.panel = new Panel(
        "settings",
        "Settings",
        [dom.tabs(tabs)]
    );

    function setPlayerSettings() {
            game.network.send("set-settings", {Settings: game.player.Settings});
    };

    function setPlayerStyle() {
            game.network.send("set-style", {Style: game.player.Style});
    };

    this.triggers = {
        "settings.sound.playMusic": function() {
            game.sound.toggleMusic();
        },
        "settings.map.world": function() {
            dom.toggle(game.world);
        },
        "settings.ui.chatNotifications": function(attach) {
            game.chat.initNotifications();
        },
        "settings.ui.chatAttached": function(attach) {
            if (attach)
                game.chat.attach();
            else
                game.chat.detach();
        },
        "settings.graphics.low": function() {
            game.map.reset();
        },
        "settings.graphics.fullscreen": function() {
            game.screen.update();
        },
        "settings.character.pathfinding": function() {
            game.player.Settings.Pathfinding = !game.player.Settings.Pathfinding;
            setPlayerSettings();
        },
        "settings.character.hideHelmet": function() {
            game.player.Style.HideHelmet = !game.player.Style.HideHelmet;
            setPlayerStyle();
            game.player.reloadSprite();
        },
    };
}

Settings.prototype = {
    triggers: null,
    makeSettingsTabs: function(map, name) {
        var self = this;
        var tabs = [];
        Object.keys(map).forEach(function(name) {
            var group = map[name];
            var tab = {
                title: T(name),
                contents: [],
            };

            var optionDesc = dom.div("settings-option-desc");
            optionDesc.placeholder = T("Select option");
            optionDesc.textContent = optionDesc.placeholder;

            Object.keys(group).forEach(function(prop) {
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

                var desc = Settings.descriptions[name] && Settings.descriptions[name][prop] || [prop, ""];
                var title = desc[0];
                var tip = desc[1];

                var checkbox = dom.checkbox(title);
                checkbox.checked = value;

                var label = checkbox.label;
                label.onmouseover = function() {
                    optionDesc.textContent = tip;
                };
                label.onmouseout = function() {
                    optionDesc.textContent = optionDesc.placeholder;
                };
                label.onchange = function() {
                    group[prop] = !group[prop];
                    localStorage.setItem(key, group[prop]);
                    self.triggers[key] && self.triggers[key](group[prop]);
                };
                tab.contents.push(label);
            });
            tab.contents.push(optionDesc);
            tabs.push(tab);
        });
        return tabs;
    },
};
