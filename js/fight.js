function Fight() {
    var target = null;
    var locked = false;

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
                game.player.selectNextTarget();
            }
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
        game.network.send("waza", args);
    }

    this.update = function() {
        if (game.player.idle()) {
            //TODO: unlock panel
        }
    };

    var actions = ["tsuki", "shomen", "irimi", "tenkan", "kaiten"];
    actions.forEach(function(action) {
        var button = document.getElementById(action + "-button");
        button.onclick = function() {
            apply(action);
        };
    });
    this.hotkey = function(key) {
        var action = actions[key-1];
        apply(action);
    };
}
