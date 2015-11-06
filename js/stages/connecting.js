"use strict";

function connectingStage() {
    game.network.run();
    this.draw = Stage.makeEllipsisDrawer();
}

Stage.add(connectingStage);
