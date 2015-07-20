function loadingStage(data) {
    game.addEventListeners();

    var forceUpdate = ("Version" in data);
    ["Version", "Recipes", "EntitiesTemplates"].forEach(function(key) {
        if (forceUpdate) {
            localStorage.setItem(key, JSON.stringify(data[key]));
        } else {
            data[key] = JSON.parse(localStorage.getItem(key));
        }
    });
    Character.skillLvls = data.SkillLvls;
    Character.initSprites();
    game.map.init(data.Bioms, data.Map);
    //for [*add item]
    Entity.init(data.EntitiesTemplates);
    Entity.recipes = data.Recipes;
    Entity.metaGroups = data.MetaGroups;
    game.initTime(data.Time, data.Tick);

    Info.prototype.damageTexture = loader.loadImage("damage.png");

    this.sync = function(data) {
        //TODO: don't send them!
        // ignore non init packets
        if (!("Location" in data))
            return;
        game.setTime(data.Time);
        loader.ready(function() {
            Entity.sync(data.Entities);
            Character.sync(data.Players);
            Character.sync(data.Mobs);
            Character.sync(data.NPCs);
            game.map.sync(data.Location);

            var wait = setInterval(function() {
                if (!game.map.ready)
                    return;
                var ready = game.entities.every(function(e) {
                    return e.sprite.ready;
                });

                if (!ready)
                    return;

                clearInterval(wait);
                game.setStage("main", data);
            }, 100);

            // if (!game.player.Settings.Premium) {
            //     game.ads.show();
            // }
        });
    };

    this.draw = function() {
        game.ctx.clear();
        game.ctx.fillStyle = "#fff";
        game.ctx.fillText(
            game.loader.status,
            CELL_SIZE,
            CELL_SIZE
        );
    };
}
Stage.add(loadingStage);
