function Fight() {
    this.panel = document.getElementById("fight-panel");

    var visible = false;
    var close = document.getElementById("fight-close-panel-button");
    close.addEventListener("click", function() {
        visible = false;
        util.dom.hide(this.panel);
        util.dom.show(game.controller.hotbar.panel);
    }.bind(this));

    var target = null;
    var locked = false;
    var panels = {
        action: document.getElementById("fight-action"),
        target: document.getElementById("fight-target"),
    };

    function apply(action) {
        if (locked) {
            game.controller.showWarning("Action is blocked")
            return;
        }

        var cmd = {
            Action: action,
        };
        if (action != "defend") {
            if (game.player.target instanceof Character) {
                cmd.EnemyId = +game.player.target.Id;
            } else {
                game.controller.showWarning("You have no target");
                return
            }
        }
        if (target)
            cmd.Target = target;

        game.network.send("fight", cmd);
        panels.action.classList.add("locked");
        locked = true;
    }

    var actions = {};
    util.dom.forEach("#fight-action > .button", function() {
        var id = this.id.split("-")[0];
        actions[id] = this;
        this.addEventListener("click", function() {
            apply(id);
        });
    });


    var targets = {};
    function setTarget(id) {
        target = id;
        for (var i in targets) {
            var action = (i == id) ? "add" : "remove";
            targets[i].classList[action]("alert");
        }
    }
    util.dom.forEach("#fight-target > .button",  function() {
        var id = this.id.split("-")[0];
        targets[id] = this;
        this.addEventListener("click", function() {
            setTarget(id);
        })
    });

    this.hotkey = function(key) {
        if (!visible)
            return;
        var id = key - 1;
        if (game.controller.modifier.shift) {
            setTarget(Object.keys(targets)[id]);
            return;
        }
        apply(Object.keys(actions)[id]);
    }

    this.update = function() {
        if (!game.player.Fight.Action) {
            panels.action.classList.remove("locked");
            locked = false;
        }
    }

    this.show = function() {
        visible = true;
        util.dom.show(this.panel);
        util.dom.hide(game.controller.hotbar.panel);
    }
}
