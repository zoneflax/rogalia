function connectingStage() {
    game.ctx.fillStyle = "#fff";
    game.ctx.fillText("...", CELL_SIZE, CELL_SIZE);

    game.network.run();
    game.ctx.clear();
    game.ctx.fillText("Connecting...", CELL_SIZE, CELL_SIZE);
}

Stage.add(connectingStage);
