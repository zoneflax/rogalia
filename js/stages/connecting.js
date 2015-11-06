"use strict";
function connectingStage() {
    game.network.run();
    var ellipsis = 0;
    var start = Date.now();
    this.draw = function() {
        var now = Date.now();
        if (now - start < 300)
            return;
        start = now;

        if (++ellipsis > 5)
            ellipsis = 0;
        game.ctx.clear();
        game.ctx.fillStyle = "#fff";
        game.forceDrawStrokedText(T("Connecting") + " " + "|".repeat(ellipsis), CELL_SIZE, CELL_SIZE);
    };
}

Stage.add(connectingStage);
