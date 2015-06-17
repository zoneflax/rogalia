Entity.MT_PORTABLE = 0;
Entity.MT_LIFTABLE = 1;
Entity.MT_STATIC = 2;

Entity.LOCATION_ON_GROUND = 0;
Entity.LOCATION_IN_CONTAINER = 1;
Entity.LOCATION_EQUIPPED = 2;
Entity.LOCATION_BURDEN = 3;
Entity.LOCATION_VENDOR = 4;


Entity.templates = {};

Entity.init = function(data) {
    data.forEach(function(props) {
        var e = new Entity();
        e.sync(props);
        Entity.templates[e.Type] = e;
    });
}


Entity.sync = function(data, remove) {
    var containers = []; //to update
    for (var id in data) {
        var edata = data[id];
        var entity = game.entities.get(id);
        if(!entity) {
            entity = new Entity(id, edata.Type);
            game.addEntity(entity);
        }
        entity.sync(edata);
        entity.initSprite();

        if(game.containers[entity.Id]) {
            containers.push(game.containers[entity.Id]);
        }
    }
    remove && remove.forEach(game.removeEntityById);

    containers.forEach(function(container) {
        container.update();
    });
},

Entity.collides = function(entity) {
    return game.filter("Entity").some(function(e) {
        return e.collides(entity.X, entity.Y, entity.Radius);
    });
};

Entity.get = function(id) {
    return game.entities.get(parseInt(id));
};
Entity.exists = function(id) {
    return !!Entity.get(id);
};

Entity.getPreview = function(group) {
    var image = new Image();
    for (var type in Entity.templates) {
        var template = Entity.templates[type];
        if (Entity.prototype.is.call(template, group)) {
            image = template.icon();
            break;
        }
    }
    image.className = "item-preview";
    return image;
}

Entity.find  = function(pattern) {
    var regex = new RegExp(pattern);
    return game.entities.filter(function(e) {
        return regex.test(e.Type);
    });
};

Entity.makeDescription = function(type) {
    var descr = document.createElement("div");
    descr.className = "item-descr";
    var info = Items[type];
    if (info)
        descr.textContent = info.desc.ru;
    return descr;
};

Entity.books = {
    $intro: "Именем Императора и Его Синода",
};

//returns tuples [type string, recipe struct]
Entity.getSortedRecipeTuples = function() {
    return Object.keys(Entity.recipes).map(function(type) {
        return [type, Entity.recipes[type]];
    }).sort(function(a, b){
        var diff = a[1].Lvl - b[1].Lvl;
        if (diff != 0)
            return diff

        return (T(a[0]) < T(b[0])) ? -1 : +1;
    });
};
