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

        if(!to) {
            to = new Character(id, from.Name);
            game.addCharacter(to);
            if(from.Name == game.login)
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
    for(var name in game.characters) {
        game.characters[name].drawAction();
    }
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
    })
};
