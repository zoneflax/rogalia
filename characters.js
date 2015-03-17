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
            if (from.Name == game.login)
                game.player = to;
            to.init(from)
        } else {
            to.sync(from);
        }
        game.map.updateObject(to);
    }

    game.player.updateEffects();
};

Character.drawActions = function() {
    game.characters.forEach(function(c) {
        c.drawAction();
    })
};

Character.spriteDir = "characters/";

Character.animations = ["idle", "run", "dig", "craft", "attack", "sit"];
Character.parts = ["feet", "legs", "body", "head"];


Character.nakedSprites = {};
Character.weaponSprites = {}
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
    "Bank": function() {
        new Bank();
    },
    "Quest": function() {
        if (confirm("I'll take 10 food from your bag and give you status point as a reward. Deal?")) {
            game.network.send("quest", {Id: this.Id});
        }
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
        var mouse = game.controller.mouse;
        game.menu.show(talks);
    },
    "Buy": function() {
        game.network.send("buy-list", {Vendor: this.Id}, Vendor.buy.bind(this));
    },
    "Sell": function() {
        game.network.send("sell-list", {Vendor: this.Id}, Vendor.sell.bind(this));
    },
};
