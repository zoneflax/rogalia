/* global game, Character, util, util, config, PathNode */

"use strict";
function mainStage(data) {
    setTimeout(function() {
        game.network.send("logon");
    }, 200);
    game.controller.initInterface();

    game.controller.chat.init(data.Chat);
    game.pixi && game.pixi.updateMap();

    this.sync = function (data) {
        if (data.Warning) {
            game.controller.showWarning(data.Warning);
            return;
        }

        Character.sync(data.Players || [], data.RemovePlayers || null);
        Character.sync(data.Mobs || [], data.RemoveMobs || null);
        Character.sync(data.NPCs || [], data.RemoveNPCs || null);

        Entity.sync(data.Entities || [], data.RemoveEntities || null);


        data.Location && game.map.sync(data.Location, data.Map);

        data.BG && game.controller.updateBG(data.BG);

        data.Shop && game.controller.shop.sync(data.Shop);

        game.controller.syncMinimap(data.RemotePlayers);
        data.Chat && game.controller.chat.sync(data.Chat);
        game.controller.skills.update();
        game.controller.fight.update();
        game.controller.craft.update();
        game.controller.journal.update();
        game.controller.updateActiveQuest();
        if (data.Players && game.player.Id in data.Players) {
            game.controller.stats.sync(data.Players[game.player.Id]);
        }
    };

    var snow = new Snow();

    var startTime = 0;
    this.update = function(currentTime) {
        currentTime = currentTime || Date.now();
        var ellapsedTime = currentTime - startTime;
        startTime = currentTime;
        var dt = ellapsedTime / 1000;

        game.entities.forEach(function(e) {
            e.update(dt);
        });
        game.missiles = game.missiles.filter((m) => m.update(dt));
        game.controller.update();
        snow.update();
    };

    var scr = game.screen;
    var cam = game.camera;
    function isVisible(t) {
        var p = t.getDrawPoint();
        return util.rectIntersects(
            p.x, p.y, t.sprite.width, t.sprite.height,
            cam.x, cam.y, scr.width, scr.height
        );
    }

    function draw(t) {
        t.draw();
    }

    function drawObject(t) {
        if (isVisible(t))
            t.draw();
    }
    function drawUI(t) {
        if (isVisible(t))
            t.drawUI();
    }
    function drawAura(t) {
        if (isVisible(t))
            t.drawAura();
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
        game.characters.forEach(drawAura);
        game.claims.forEach(drawClaim);

        // this.drawPotentialFields();

        if (config.graphics.topologicalSort) {
            this.drawTopologic();
        } else {
            game.sortedEntities.traverse(drawObject);
        }

        // this.drawOrder();

        _.forEach(game.missiles, draw);

        if (config.graphics.drawPath) {
            this.drawPath();
        }

        snow.draw();

        if (debug.map.darkness)
            game.map.drawDarkness();

        game.characters.forEach(drawUI);
        game.controller.draw();
        // this.debug();
        game.ctx.restore();
    };

    this.drawPath = function() {
        // if (PathNode.debug) {
        //     _.forEach(PathNode.debug, function(node) {
        //         game.ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
        //         game.iso.fillCircle(node.point.x, node.point.y, 5);
        //     });
        // }
        if (game.player.path.length) {
            game.ctx.fillStyle = "#c33";
            game.player.path.forEach(function(point) {
                game.iso.fillCircle(point.x, point.y, 2);
            });
        }
    };

    var hueRotate = 0;
    this.drawGlobalEffects = function() {
        if ("MushroomTrip" in game.player.Effects || "BadTrip" in game.player.Effects) {
            game.canvasContainer.style.filter = "hue-rotate(" + (hueRotate % 360) +"deg)";
            hueRotate += 20;
        } else if (game.player.Instance == "sanctuary") {
            game.canvasContainer.style.filter = "grayscale(100%)";
        } else {
            game.canvasContainer.style.filter = "";
        }
    };

    this.end = function() {};

    /* experimental and debug features */
    this.drawPotentialFields = function() {
        var fields = game.player.potentialFields();
        var D = 500;
        var STEP = 8;
        for (var y = game.player.Y - D; y < game.player.Y + D; y += STEP) {
            for (var x = game.player.X - D; x < game.player.X + D; x += STEP) {
                var potential = game.potentialAt(fields, {x, y});
                var color = (potential > 0)
                    ? "rgba(0, " + Math.round(potential) + ",0, 0.3)"
                    : "rgba(" + Math.round(-potential) + ", 0, 0, 0.3)";
                game.ctx.fillStyle = color;
                game.iso.fillRect(x, y, STEP, STEP);
            }
        }
    };

    this.drawOrder = function() {
        var i = 0;
        game.sortedEntities.traverse(function(object)  {
            object.draw();
            var p = object.screen();
            game.ctx.fillStyle = "#fff";
            game.drawStrokedText(i++, p.x, p.y);

        });
    };

    this.drawTopologic = function() {
        let list = this.getDrawableList();
        for (let i = 0; i < list.length; i++) {
            let entity = list[i];
            const width = (entity.Width/2 || entity.Radius);
            const height = (entity.Height/2 || entity.Radius);
            entity.graph = {
                maxX: entity.X + width,
                maxY: entity.Y + height,
                minX: entity.X - width,
                minY: entity.Y - height,
                z: entity.getZ(),
                behind: [],
                visited: false,
                depth: 0,
            };
        }

        for (let i = 0; i < list.length; i++) {
            let entity = list[i].graph;
            for (let j = i+1; j < list.length; j++) {
                let other = list[j].graph;
                if (entity.z !== other.z)
                    continue;
                if (other.minX < entity.maxX && other.minY < entity.maxY)
                    entity.behind.push(list[j]);
                else if (entity.minX < other.maxX && entity.minY < other.maxY)
                    other.behind.push(list[i]);
            }
        }

        for (let i = 0; i < list.length; i++) {
            visit(list[i]);
        }

        list = util.msort(list, function(a, b) {
            var z = a.graph.z - b.graph.z;
            if (z != 0)
                return z;

            return (a.graph.depth >= b.graph.depth) ? +1 : -1;
        });
        for (let i = 0; i < list.length; i++) {
            list[i].draw();
        }
    };

    let depth = 0;
    function visit(entity) {
        if (entity.graph.visited)
            return;
        entity.graph.visited = true;
        for (let i = 0; i < entity.graph.behind.length; i++) {
            visit(entity.graph.behind[i]);
        }
        entity.graph.depth = depth++;
    }

    this.getDrawableList = function() {
        return game.entities.filter(function(e) {
            return e instanceof Character || e.inWorld();
        });
    };

    this.debug = function() {
        game.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        game.ctx.fillRect(game.camera.x, game.camera.y, game.screen.width, game.screen.height);
    };
}

Stage.add(mainStage);
