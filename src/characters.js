/* global Bank, Exchange, game, dom, Vendor, T, Character, Panel, TS */

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
    remove && remove.forEach((id) => game.removeCharacterById(id));
    for (var id in data) {
        var from = data[id];
        var to = game.entities.get(id);
        if (!to) {
            to = new Character(id);
            to.init(from);
            game.addCharacter(to);
        } else {
            to.sync(from);
        }
    }
    game.player.updateEffects();
    game.controller.syncMinimap();
};

Character.drawActions = function() {
    game.characters.forEach(function(c) {
        c.drawAction();
    });
};

Character.spriteDir = "characters/";
Character.mobSpriteDir = "characters/mobs/";
Character.npcSpriteDir = "characters/npcs/";
Character.npcAvatarSpriteDir = "characters/npcs/avatars/";

Character.animations = ["idle", "run", "dig", "craft", "attack", "sit", "ride"];
Character.clothes = ["feet", "legs", "body", "head"];

Character.clothesIndex = function(name) {
    return Character.clothes.indexOf(name);
};

Character.skull = null;

Character.sprites = {
    male: {
        naked: {},
        weapons: {},
    },
    female: {
        naked: {},
        weapons: {},
    },
    effects: {
    }
};

Character.flags = {
    Empire: null,
    Confederation: null,
};

Character.sex = function(sex) {
    return ["male", "female"][sex];
};

Character.partyLoadQueue = {};

Character.npcActions = {
    "Set citizenship": function() {
        var id = this.Id;
        var set = function(name) {
            return function() {
                game.network.send("set-citizenship", {Id: id, Name: name});
            };
        };
        new Panel("citizenship", "Citizenship", [
            dom.button(T("Empire"), "", set("Empire")),
            dom.button(T("Confederation"), "", set("Confederation")),
            dom.hr(),
            dom.button(T("I want to be free"), "", set("")),
        ]).show();
    },
    "Get claim": function() {
        game.popup.alert(T("You can get claim from the Scrooge in the bank"));
    },
    "Get village claim": function() {
        var id = this.Id;
        game.popup.prompt(T("Name") + "?", "", function(name) {
            game.network.send("get-village-claim", {Id: id, Name: name});
        });
    },
    "Get vendor license": function() {
        var id = this.Id;
        new Panel(
            "vendor-license",
            T("Vendor license"),
            [
                T("The license will allow you to set up a vendor post in your claim."),
                dom.br(),
                dom.hr(),
                dom.wrap("slot", Entity.templates["vendor-license"].icon()),
                T("Cost") + ": ",
                Vendor.createPrice(2 * 100 * 100),
                dom.br(),
                dom.button(T("Buy"), "", function() {
                    game.network.send("get-vendor-license", {Id: id});
                }),
                dom.button(T("Recipe"), "", function() {
                    game.controller.craft.search("vendor-post", true);
                }),
            ]
        ).setTemporary(true).show();
    },

    "Bank": function() {
        new Bank(this);
    },
    "Exchange": function() {
        new Exchange(this);
    },
    "Quest": function() {
        var quests = this.getQuests();
        //TODO: remove quest button from dialog, instead of this stupid warning
        if (quests.length == 0) {
            game.controller.showWarning(T("No more quests"));
            return;
        }
        var self = this;
        var talks = {};
        quests.forEach(function(q) {
            var quest = new Quest(q, self);
            var name = quest.getName() + " (" + quest.getStatusMarker() + ")";
            talks[name] = function() {
                quest.showPanel();
            };
        });
        game.menu.show(talks);
    },
    "Talk": function() {
        var self = this;
        var info = this.getTalks();
        var panel = new Panel(
            "interaction",
            this.Name,
            [
                // self.avatar(),
                dom.wrap("", info.talks.map(function(text) {
                    return dom.tag("p", "", {text: text});
                })),
                dom.make("ul", Object.keys(info.actions).map(function(title) {
                    return dom.tag("li", "talk-link", {
                        text: info.actions[title],
                        onclick: function() {
                            panel.close();
                            Character.npcActions[title].call(self);
                        }
                    });
                })),
            ]
        );
        panel.entity = this;
        panel.show();

    },
    "Trade": function() {
        game.controller.vendor.open(this);
    },
    "Auction": function() {
        game.controller.auction.open(this);
    },
    "Drink water": function() {
        game.network.send("buy-water", {Id: this.Id});
    },
    "Buy sex": function() {
        game.network.send("buy-sex", {Id: this.Id});
    },
    "Show instances": function() {
        var self = this;
        game.network.send("instance-list", {Id: this.Id}, function(data) {
            if (!data.Instances) {
                game.popup.alert(T("No available instances"));
                return;
            }

            var instances = dom.table(
                [T("Name"), T("Min"), T("Max"), T("Cost"), ""],
                data.Instances.map(function(instance) {
                    var enter = dom.button(T("Enter"));
                    enter.onclick = function() {
                        game.network.send("instance", {Id: self.Id, Name: instance.Name}, () => panel.close());
                    };
                    return [
                        TS(instance.Name),
                        instance.MinLvl,
                        instance.MaxLvl,
                        Vendor.createPrice(instance.Cost),
                        enter,
                    ];
                })
            );
            var panel = new Panel("instances", "Instances", [instances]);
            panel.show().setEntity(self);
        });
    },
};
