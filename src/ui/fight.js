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

    this.combo = {
        elem: document.getElementById("combos"),
        combos: [
            {
            	name: "de",
		actions: "irimi-tsuki",
                dontStack: ["De", "Su", "Nya"],
            },
            {
                name: "su",
		actions: "irimi-shomen",
                dontStack: ["De", "Su", "Nya"],
            },
            {
                name: "nya",
		actions: "kaiten-kaiten",
                dontStack: ["De", "Su", "Nya"],
            },
            {
                name: "ikkyo",
		actions: "irimi-tsuki-tsuki",
                require: "De",
            },
            {
                name: "shihonage",
		actions: "irimi-tenkan-shomen",
                require: "Su",
            },
            {
		name: "iriminage",
		actions: "irimi-tenkan-kaiten",
                require: "Nya",
            },
        ],
        timeout: null,
        sync: function(waza) {
            clearTimeout(this.timeout);

            var duration = 5000;
            var possible = [];
            if (waza.Combo == "") {
                possible = this.possibleStarts();
            } else {
                possible = this.possibleContinuations(waza.Combo);
                var effects = game.player.Effects;
                var buf = effects["De"] || effects["Su"] || effects["Nya"];
                if (buf) {
                    duration = buf.Duration / 1e6 - (Date.now() - buf.Added*1000);
                }
            }

            if (possible.length == 0) {
                dom.clear(this.elem);
                return;
            }

            this.timeout = setTimeout(function() {
                dom.clear(this.elem);
            }.bind(this), duration);

            dom.setContents(this.elem, dom.wrap("possible-actions", this.renderActions(possible, waza.Combo)));
        },
        renderActions: function(actions, currentCombo) {
            return actions.map(function(combo) {
                var current = _.compact(currentCombo.split("-"));
                var actions = combo.actions.split("-");
                var l = Math.max(current.length, actions.length);
                var chain = [];
                var action = "";
                for (var i = 0; i < l; i++) {
                    chain.push(dom.span(T(actions[i]), (i < current.length) ? "done" : ""));
                    chain.push(" → ");
                    if (i == current.length)
                        action = actions[i];
                }

                chain.push(dom.span(T(combo.name), "finishing"));
                return dom.wrap("combo", [
                    dom.img("assets/icons/actions/" + action + ".png"),
                    dom.wrap("chain", chain),
                ]);
            });
        },
        possibleStarts: function() {
            return this.combos.filter(function(combo) {
                    return combo.require && game.player.Effects[combo.require];
            });
        },
        possibleContinuations: function(currentCombo) {
            return this.combos.filter(function(combo) {
                if (!_.startsWith(combo.actions, currentCombo)) {
                    return false;
                }

                if (_.intersection(combo.dontStack, _.keys(game.player.Effects)).length > 0) {
                    return false;
                }

                if (combo.require && !game.player.Effects[combo.require]) {
                    return false;
                }

                return true;
            });
        },
    };
}
