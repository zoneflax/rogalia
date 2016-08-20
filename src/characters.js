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

Character.initSprites = function() {
    Character.animations.forEach(function(animation) {
        Character.sprites.male.naked[animation] = {
            clean: new Sprite(Character.spriteDir + "male/" + animation + "/naked.png"),
            default: new Sprite(Character.spriteDir + "male/" + animation + "/naked.png"),
        };
        Character.sprites.female.naked[animation] = {
            clean: new Sprite(Character.spriteDir + "female/" + animation + "/naked.png"),
            default: new Sprite(Character.spriteDir + "female/" + animation + "/naked-default.png"),
        };
    });
    ["sword"].forEach(function(weapon) {
        Character.sprites.male.weapons[weapon] = new Sprite(Character.spriteDir + "male/weapon/" + weapon + ".png");
        Character.sprites.female.weapons[weapon] = new Sprite(Character.spriteDir + "female/weapon/" + weapon + ".png");
    });
    // shared by all characters; stupid by fast?
    // TODO: 99% of the time we don't need it.
    [["stun", 64, 42]].forEach(function(effect) {
        var name = effect[0];
        var width = effect[1];
        var height = effect[2];
        var sprite = new Sprite(Character.spriteDir + "/effects/" + name + ".png", width, height);
        Character.sprites.effects[name] = sprite;
    });
    Character.corpse = {
        corpse: new Sprite("icons/corpse/corpse.png"),
        arrow: new Sprite("icons/corpse/arrow.png"),
    };

    Character.flags.Empire = new Sprite("icons/flags/empire.png");
    Character.flags.Confederation = new Sprite("icons/flags/confederation.png");
    Character.flags.red = new Sprite("icons/flags/red.png");
    Character.flags.blue = new Sprite("icons/flags/blue.png");
    Character.pvpFlag = new Sprite("icons/pvp.png");
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
        game.network.send("get-claim", {Id: this.Id});
    },
    "Get village claim": function() {
        var id = this.Id;
        game.prompt(T("Name") + "?", "", function(name) {
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
                Vendor.createPrice(10 * 100 * 100),
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
    "Barbershop": function() {
        new Barbershop(this);
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
                self.avatar(),
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
                game.alert(T("No available instances"));
                return;
            }

            var instances = dom.table(
                [T("Name"), T("Min"), T("Max"), T("Cost"), ""],
                data.Instances.map(function(instance) {
                    var enter = dom.button(T("Enter"));
                    enter.onclick = function() {
                        game.network.send("instance", {Id: self.Id, Name: instance.Name});
                    };
                    return [
                        TS(instance.Name),
                        instance.MinLvl,
                        instance.MaxLvl,
                        Vendor.createPrice(instance.Cost),
                        enter,
                    ];
                    return inst;
                })
            );
            new Panel("instances", "Instances", [instances]).show().setEntity(self);
        });
    },
};
