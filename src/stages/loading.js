/* global loader, Character, game, Stage, CELL_SIZE */

"use strict";
function loadingStage(version) {
    game.addEventListeners();

    var req = new XMLHttpRequest();
    req.open("GET", "metadata.json?version=" + version, true);
    req.onload = function() {
        var data = JSON.parse(this.responseText);

        Entity.metaGroups = data.MetaGroups;
        game.map.initBioms(data.Bioms);
        Character.skillLvls = data.SkillLvls;
        // game.initTime(data.Tick);
        Entity.recipes = data.Recipes;
        Entity.init(data.EntitiesTemplates); //for [*add item]

        game.network.send("enter", {Name: game.playerName}, sync);
    };
    req.send(null);


    function sync(data) {
        game.setTime(data.Time);
        game.map.initMap(data.Map);
        Character.initSprites();

        loader.ready(function() {
            Character.sync(data.Players);
            Character.sync(data.Mobs);
            Character.sync(data.NPCs);
            Entity.sync(data.Entities);
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
        });
    };

    this.draw = function() {
        game.ctx.clear();
        game.ctx.fillStyle = "#fff";
        game.forceDrawStrokedText(
            game.loader.status,
            CELL_SIZE,
            CELL_SIZE
        );
    };
}
Stage.add(loadingStage);
