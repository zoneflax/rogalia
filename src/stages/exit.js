"use strict";
function exitStage(message) {
    message = message || T("Refresh page...");
    game.ctx.fillStyle = "#fff";
    game.forceDrawStrokedText(
        T(message),
        CELL_SIZE,
        CELL_SIZE
    );

    game.network.disconnect();

    dom.append(game.world, dom.wrap("#crash-help", [
        game.button.vk(),
        dom.button(T("Reset settings"), "", game.controller.reset),
        game.button.logout(),
        dom.button(T("Reload"), "", game.reload),
    ]));
};
Stage.add(exitStage);
