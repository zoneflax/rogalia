"use strict";
Character.equipSlots =  [
    "bag",
    "right-hand",
    "left-hand",
    "head",
    "neck",
    "body",
    "legs",
    "feet",
];

Character.attrs = ["Strength", "Vitality", "Dexterity", "Intellect", "Perception", "Wisdom"];
Character.vitamins = ["Protein", "Fat", "Carbohydrate", "Phosphorus", "Calcium", "Magnesium"];

Character.copy = function copy(to, from) {
    for(var prop in from) {
        if(from[prop] instanceof Object && !Array.isArray(from[prop])) {
            to[prop] = {};
            copy(to[prop], from[prop]);
        } else {
            to[prop] = from[prop];
        }
    }
};

Character.sync = function(data, remove) {
    remove && remove.forEach(game.removeCharacterById);
    for (var id in data) {
        var from = data[id];
        var to = game.entities.get(id);
        if (!to) {
            to = new Character(id, from.Name);
            game.addCharacter(to);
            if (from.Name == game.player.Name) {
                to.isPlayer = true;
                game.player = to;
            }
            to.init(from);
        } else {
            to.sync(from);
        }
    }

    game.player.updateEffects();
};

Character.drawActions = function() {
    game.characters.forEach(function(c) {
        c.drawAction();
    });
};

Character.spriteDir = "characters/";

Character.animations = ["idle", "run", "dig", "craft", "attack", "sit"];
Character.clothes = ["feet", "legs", "body", "head"];

Character.clothesIndex = function(name) {
    return Character.clothes.indexOf(name);
};

Character.skull = null;

Character.nakedSprites = {};
Character.weaponSprites = {};
Character.effectSprites = {};

Character.initSprites = function() {
    Character.animations.forEach(function(animation) {
        var path = Character.spriteDir + "/man/" + animation + "/naked.png";
        var sprite = new Sprite(path);
        Character.nakedSprites[animation] = sprite;
    });
    ["sword"].forEach(function(weapon) {
        var sprite = new Sprite(Character.spriteDir + "/man/weapon/" + weapon + ".png");
        Character.weaponSprites[weapon] = sprite;
    });
    // shared by all characters; stupid by fast?
    [["stun", 64, 42]].forEach(function(effect) {
        var name = effect[0];
        var width = effect[1];
        var height = effect[2];
        var sprite = new Sprite(Character.spriteDir + "/effects/" + name + ".png", width, height);
        Character.effectSprites[name] = sprite;
    });
    Character.skull = new Sprite("skull.png");
};


Character.npcActions = {
    "Set citizenship": function() {
        var id = this.Id;
        var set = function(name) {
            return function() {
                game.network.send("set-citizenship", {Id: id, Name: name});
            };
        };
        var citizenships = {
            getActions: function() {
                return {
                    "I choose Empire": set("Empire"),
                    "I choose Confederation": set("Confederation"),
                    "I want to be free": set(""),
                };
            }
        };
        game.menu.show(citizenships);
    },
    "Get claim": function() {
        game.network.send("get-claim", {Id: this.Id});
    },
    "Get village claim": function() {
        var name = prompt("Name?", "");
        if (name)
            game.network.send("get-village-claim", {Id: this.Id, Name: name});
    },
    "Bank": function() {
        new Bank();
    },
    "Exchange": function() {
        new Exchange();
    },
    "Quest": function() {
        var quests = this.getQuests();
        //TODO: remove quest button from dialog, instead of this stupid warning
        if (quests.length == 0) {
            game.controller.showWarning(T("No more quests"));
            return;
        }
        var id = this.Id;
        var talks = {
            getActions: function() {
                var actions = {};
                quests.forEach(function(q) {
                    var quest = new Quest(q);
                    var name = quest.getName() + " (" + quest.getStatusMarker() + ")";
                    actions[name] = function() {
                        var panel = new Panel("quest", "Quest", quest.getContents());
                        panel.quest = quest;
                        panel.show();
                    };
                });
                return actions;
            }
        };
        game.menu.show(talks);
    },
    "Talk": function() {
        var name = this.Name;
        var talks = {
            getActions: function() {
                var actions = {};
                for (var i in game.talks.stories) {
                    actions[i] = function() {
                        var p = document.createElement("p");
                        p.textContent = this;
                        var panel = new Panel("story", name, [p]);
                        panel.show();
                    }.bind(game.talks.stories[i]);
                }
                return actions;
            }
        };
        game.menu.show(talks);
    },
    "Buy": function() {
        game.network.send("buy-list", {Vendor: this.Id}, Vendor.buy.bind(this));
    },
    "Sell": function() {
        game.network.send("sell-list", {Vendor: this.Id}, Vendor.sell.bind(this));
    },
    "Drink water": function() {
        game.network.send("buy-water", {Id: this.Id});
    },
    "Buy sex": function() {
        game.network.send("buy-sex", {Id: this.Id});
    },
    "Buy indulgence": function() {
        game.alert("Пока не реализовано :-(");
    }
};
