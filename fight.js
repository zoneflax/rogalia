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

    //TODO: use for claim?
    // function tenkai() {
    //     var div = document.createElement("div");
    //     var dirs = {
    //         "⇖": 5, "⇑": 4, "⇗": 3,
    //         "⇐": 6, "X": null, "⇒": 2,
    //         "⇙": 7, "⇓": 0, "⇘": 1,
    //     };
    //     for (var name in dirs) {
    //         var button = document.createElement("button");
    //         button.textContent = name;
    //         var dir = dirs[name];
    //         if (dir === null)
    //             dir = (game.player.sprite.position+4)%8;
    //         button.onclick = function(dir) {
    //             game.network.send("waza", {Name: "Tenkai", Dir: dir, Id: game.player.target.Id});
    //             panel.hide();
    //         }.bind(this, dir);
    //         div.appendChild(button);
    //     }
    //     var panel =  new Panel("tenkai", "Tenkai", [div]);
    //     panel.show();
    // }

    function apply(action) {
        if (locked) {
            game.controller.showWarning("Action is blocked");
            return;
        }

        switch (action) {
        case "irimi":
        case "kaiten":
        case "tenkan":
            break;
        default:
            if (!(game.player.target instanceof Character)) {
                game.controller.showWarning("You have no target");
                return;
            }
        }

        var args = {Name: util.ucfirst(action)};
        if (game.player.target)
            args.Id = game.player.target.Id;
        switch (action) {
        case "irimi":
        case "kaiten":
            args.X = game.controller.world.x;
            args.Y = game.controller.world.y;
        }
        panels.action.classList.add("locked");
        locked = true;
        game.network.send("waza", args);
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
        });
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
    };

    this.update = function() {
        if (game.player.idle()) {
            panels.action.classList.remove("locked");
            locked = false;
        }
    };

    this.show = function() {
        visible = true;
        util.dom.show(this.panel);
        util.dom.hide(game.controller.hotbar.panel);
    };
}
