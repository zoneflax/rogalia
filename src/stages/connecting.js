"use strict";

function connectingStage() {
    game.network.run(function() {
        game.setStage("login");
    });
    this.draw = Stage.makeEllipsisDrawer();
}

Stage.add(connectingStage);
