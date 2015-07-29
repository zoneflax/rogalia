function mainStage(data) {
    game.controller.interfaceInit(data.Chat);
    game.controller.system.users.sync(data.PlayersOnline);
    game.controller.minimap.sync(data.PlayersOnline);

    this.sync = function (data) {
        if (data.Warning) {
            game.controller.showWarning(data.Warning);
            return;
        }
        if (data.Reconnect) {
            document.location.search = "?server=" + data.Reconnect;
            return;
        }
        Entity.sync(data.Entities || [], data.RemoveEntities || null);
        Character.sync(data.Players || [], data.RemovePlayers || null);
        Character.sync(data.Mobs || [], data.RemoveMobs || null);
        Character.sync(data.NPCs || [], data.RemoveNPCs || null);

        data.Location && game.map.sync(data.Location);

        if (data.PlayersOnline) {
            game.controller.system.users.sync(data.PlayersOnline);
            game.controller.minimap.sync(data.PlayersOnline);
        }

        game.controller.chat.sync(data.Chat || []);
        game.controller.skills.update();
        game.controller.fight.update();
        game.controller.craft.update();
        game.controller.quests.update();
        if (data.Players && game.player.Id in data.Players) {
            game.controller.stats.sync();
        }
    };

    var startTime = 0;
    this.update = function(currentTime) {
        currentTime = currentTime || Date.now();
        var ellapsedTime = currentTime - startTime;
        startTime = currentTime;
        game.epsilon = ellapsedTime / 1000;

        game.entities.forEach(function(e) {
            e.update(game.epsilon);
        });
        game.help.update();
        game.controller.update();
    };

    function drawObject(t) {
        t.draw();
    }
    function drawUI(t) {
        t.drawUI();
    }
    function drawClaim(t) {
        t.drawClaim();
    }

    // game.ctx.scale(0.3, 0.3);
    // game.ctx.translate(1000, 1000);

    this.draw = function() {
        game.ctx.clear();
        game.ctx.save();
        game.ctx.translate(-game.camera.x, -game.camera.y);

        this.drawGlobalEffects();

        game.map.draw();
        game.claims.forEach(drawClaim);
        game.sortedEntities.traverse(drawObject);
        if (config.map.darkness)
            game.map.drawDarkness();
        game.sortedEntities.traverse(drawUI);
        game.controller.draw();
        // this.debug();
        game.ctx.restore();
    };

    var hueRotate = 0;
    this.drawGlobalEffects = function() {
        if ("MushroomTrip" in game.player.Effects) {
            game.canvas.style.filter = "hue-rotate(" + (hueRotate % 360) +"deg)";
            hueRotate += 20;
        } else {
            game.canvas.style.filter = "";
        }
    };

    this.debug = function() {
        // TODO: debug-remove
        // game.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        // game.ctx.fillRect(game.camera.x, game.camera.y, game.screen.width, game.screen.height);

        // TODO: debug-remove
        // if (game.network.astar) {
        //     game.network.astar.forEach(function(node) {
        //         if (node.Unpassable)
        //             return;
        //         game.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        //         game.iso.fillRect(node.X, node.Y, node.Width, node.Height);
        //             game.ctx.strokeStyle = "#333";
        //         game.iso.strokeRect(node.X, node.Y, node.Width, node.Height);
        //     });
        // }

    };
    this.end = function() {};
}

Stage.add(mainStage);
