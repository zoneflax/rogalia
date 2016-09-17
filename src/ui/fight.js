"use strict";
function Fight() {
    var target = null;

    var GCD = 500;
    var lastSend = Date.now();

    var actions = ["tsuki", "shomen", "irimi", "tenkan", "kaiten"];
    var buttons = actions.map(function(action) {
        var button = document.getElementById(action + "-button");
        button.onclick = function() {
            apply(action, true);
        };
        return button;
    });

    var hotbar = game.controller.actionHotbar;

    function apply(action, prepare) {
        var now = Date.now();
        if (now - lastSend < GCD) {
            game.controller.showWarning(T("Cooldown"));
            return;
        }
        lastSend = now;

        if (!prepare && !game.controller.mouse.isValid())
            return;

        switch (action) {
        case "irimi":
            if (prepare) {
                game.controller.setClick(
                    function() {
                        apply(action);
                    },
                    function() {
                        game.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                        var p = game.controller.world.point;
                        game.iso.fillCircle(p.x, p.y, 8);
                    });
                return;
            }
        case "kaiten":
        case "tenkan":
            break;
        default:
            if (!(game.player.target instanceof Character)) {
                game.player.selectNextTarget();
            }
            if (!(game.player.target instanceof Character)) {
                game.controller.showWarning("Select target");
                return;
            }
            if (prepare) {
                game.controller.setClick(
                    function() {
                        apply(action);
                    },
                    function() {
                        var p = new Point(game.controller.world.point).sub(new Point(game.player));
                        var sector = game.player.sector(Math.PI/4, p.x, p.y);
                        game.player.drawAttackRadius(sector);
                    });
                return;
            }
        }

        var args = {Name: util.ucfirst(action)};
        if (game.player.target)
            args.Id = game.player.target.Id;

        args.X = game.controller.world.x;
        args.Y = game.controller.world.y;

        // updateCombo(action);

        switch (action) {
        case "shomen":
            var button = buttons[actions.indexOf("shomen")];
            button.classList.add("cooldown");
            setTimeout(function() {
                button.classList.remove("cooldown");
            }, 2000);
            break;
        }

        game.network.send("waza", args);

        hotbar.classList.add("cooldown");
        setTimeout(function() {
            hotbar.classList.remove("cooldown");
        }, GCD);
    }

    this.update = function() {
        if (game.player.idle()) {
            //TODO: unlock panel
        }
    };

    this.hotkey = function(key) {
        var action = actions[key-1];
        apply(action);
    };


    var combos = {
        irimi : {
            tsuki: {
                tsuki: {name:  "ikkyo"},
                name: "de",
            },
            shomen: {
                name: "su",
            }
        },
    };

    var comboFirst = dom.div("combo combo-first");
    var combo = [];
    var comboTimeout = null;
    function updateCombo(action) {
        switch (combo.length) {
        case 0:
            combo.push(action);
            dom.setContents(comboFirst, [
                action,
                dom.wrap("combo-continuation", _.map(combos[action], function(continuation) {
                    return dom.wrap("combo", continuation.name);
                })),
            ]);
            dom.insert(comboFirst, game.world);
            break;
            // comboTimeout = setTimeout(function() {
            //     dom.remove(comboStart);
            // }, 15000);
        case 1:
            var next = combos[combo[0]][action];
            if (next) {
                combo.push(action);
                dom.setContents(comboFirst, [
                    combo.join(" "),
                    dom.wrap("combo-continuation", _.map(_.filter(next, _.isString), function(buff) {
                        return dom.wrap("combo", buff);
                    })),
                ]);
            } else {
            }
            break;
        }
    }
}
