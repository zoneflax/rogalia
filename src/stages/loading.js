/* global loader, Character, game, Stage, CELL_SIZE, playerStorage, ProgressBar, dom, T */

"use strict";
function loadingStage(version) {
    game.ctx.clear();
    game.addEventListeners();
    playerStorage.setPrefix(game.playerName + ".");

    const progress = new ProgressBar(game.world, T("Loading") + ": ");

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

            const wait = setInterval(function() {
                if (!game.map.ready)
                    return;
                const ready = game.entities.every(e => e.sprite.ready);

                if (!ready)
                    return;

                clearInterval(wait);
                game.setStage("main", data);
            }, 100);
        });
    };

    this.draw = function() {
        const status = game.loader.status;
        // wait a bit while sync start loading stuff
        if (status.loaded > 1) {
            progress.value = status.loaded/status.loading*100;
        }
    };

    this.end = function() {
        dom.remove(progress.element);
    };
}
Stage.add(loadingStage);
