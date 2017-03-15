/* global game, T, _, ContainerSearch, TS */

"use strict";
Entity.MT_PORTABLE = 0;
Entity.MT_LIFTABLE = 1;
Entity.MT_STATIC = 2;

Entity.LOCATION_ON_GROUND = 0;
Entity.LOCATION_IN_CONTAINER = 1;
Entity.LOCATION_EQUIPPED = 2;
Entity.LOCATION_BURDEN = 3;
Entity.LOCATION_VENDOR = 4;

Entity.queueable = function(action) {
    return _.includes([
        "slice",
        "disassemble",
        "entity-destroy",
        "BreakOff",
        "Rinse",
        "Gut",
    ], action) && game.controller.modifier.ctrl && game.controller.modifier.shift;
};

Entity.repeatable = function(action) {
    return _.includes(["Prospect"], action);
};

Entity.usable = function(entity) {
    return _.includes(["label"], entity.Group);
};

Entity.templates = {};

Entity.groupTags = {
    "prospector": ["tool"],
    "shovel": ["tool"],
    "crowbar": ["tool"],
    "pickaxe": ["tool"],
    "axe": ["tool"],
    "hammer": ["tool"],
    "scissors": ["tool"],
    "saw": ["tool"],
    "fishing-rod": ["tool"],
    "lasso": ["tool"],
    "insect-net": ["tool"],
    "needle": ["tool"],

    "knife": ["tool", "weapon", "melee-weapon"],

    "spear": ["weapon", "melee-weapon"],
    "sword": ["weapon", "melee-weapon"],

    "bow": ["weapon", "ranged-weapon"],
    "energy-gun": ["weapon", "ranged-weapon"],

    "body-armor": ["armor"],
    "head-armor": ["armor"],
    "legs-armor": ["armor"],
    "feet-armor": ["armor"],
    "shield": ["armor"],

    "necklace": ["accessory"],

    "jewel": ["part"],

    "oven": ["equipment", "cooking", "container"],

    "floor": ["housing"],
    "roof": ["housing"],
    "wall": ["housing"],
    "gate": ["housing"],
    "fence": ["housing"],

    "seat": ["house", "furniture"],
    "table": ["house", "furniture"],
    "bed": ["house", "furniture"],

    "liquid-container": ["vessel"],
    "liquid-container-liftable": ["vessel"],

    "potion": ["consumable"],
    "alcohol": ["consumable"],
    "drug": ["consumable"],
    "smoke": ["consumable"],
    "bag": ["container"],
    "feeder": ["container"],

    "playing-figure": ["game"],
};

Entity.miscGroups = [
    "portable",
    "liftable",
    "static",
    "liquid-container-liftable",
    "converter",
    "processor",
];

Entity.recipes = {};

Entity.tags = {};
Entity.sortedTags = [];

Entity.init = function(templates, recipes) {
    Entity.recipes = recipes;

    templates.forEach(props => {
        var e = new Entity();
        e.sync(props);
        e.tags = _.uniq(_.compact(_.concat(Entity.groupTags[e.Group], e.Group, e.Recipe.Tags)));
        Entity.templates[e.Type] = e;
    });

    Entity.tags = _.reduce(recipes, function(tags, recipe, type) {
        const entity = Entity.templates[type];
        entity.tags.forEach(function(tag) {
            tags[tag] = (tags[tag] || []).concat(entity);
        });
        return tags;
    }, {});

    Entity.sortedTags = _.toPairs(Entity.tags).sort(([, a], [, b]) => b.length - a.length);
};


Entity.sync = function(data, remove) {
    remove && remove.forEach((id) => game.removeEntityById(id));

    var containers = []; //to update
    for (var id in data) {
        var edata = data[id];
        var entity = game.entities.get(id);
        if (!entity) {
            entity = new Entity(edata.Type, id);
            game.addEntity(entity);
        }
        entity.sync(edata);
        entity.initSprite();

        if (game.containers[entity.Id]) {
            containers.push(game.containers[entity.Id]);
        }
    }

    if (containers.length == 0) {
        return;
    }

    containers.forEach(function(container) {
        if (container.panel.visible)
            container.update();
        else
            container.syncReq();
    });
    ContainerSearch.update();
},

Entity.get = function(id) {
    return game.entities.get(parseInt(id));
};
Entity.exists = function(id) {
    return !!Entity.get(id);
};

Entity.getPreview = function(kind) {
    const tmpl = _.find(Entity.templates, (tmpl) => tmpl.is(kind));
    const preview = tmpl.icon();
    preview.classList.add("item-preview");
    return preview;
};

Entity.find  = function(pattern) {
    var regex = new RegExp(pattern);
    return game.entities.filter(function(e) {
        return regex.test(e.Type);
    });
};

Entity.wipe = function(pattern) {
    var queue = Entity.find(pattern);
    var interval = setInterval(function() {
        if (queue.length > 0) {
            queue.pop().destroy();
        } else {
            clearInterval(interval);
        }
    }, 500);
};

Entity.books = {
    $intro: "Именем Императора и Его Синода",
};
