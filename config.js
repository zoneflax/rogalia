var CELL_SIZE = 32;
var FONT_SIZE = 14;

var config = {
    map: {
        darkness: false,
        simpleDarkness: false,
        ray: false,
    },
    language: {
        Russian: false,
    },
    gameplay: {
        pathfinding: function() { return game.player.Settings.Pathfinding },
    },
    ui: {
        hp: false,
        name: false,
        npc: false,
        simpleFonts: true,
        minimapObjects: false,
        showDonate: true,
        allowSelfSelection: true,
        fillClaim: false,
        strokeClaim: true,
    },
    system: {
        quitConfirm: true,
    },
    cursor: {
        dontHide: false,
        autoHighlightDoors: false,
    },
    sound: {
        playSounds: true,
        playMusic: true
    },
}
var debug = {
    ui: {
        world: true,
    },
    player: {
        box: false,
        position: false,
        path: false,
    },
    entity: {
        box: false,
        position: false,
        logOnClick: false,
    },
    map: {
        grid: false,
        position: false,
    },
    network: {
        length: false,
        data: false,
    },
};
