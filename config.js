var CELL_SIZE = 32;
var FONT_SIZE = 14;
var DEFAULT_CLIENT_WIDTH = 1024;
var DEFAULT_CLIENT_HEIGHT = 768;

if (document.location.hash.indexOf("wide") != -1) {
    DEFAULT_CLIENT_WIDTH = 1280;
    DEFAULT_CLIENT_HEIGHT = 720;
}

var config = {
    map: {
        darkness: false,
        simpleDarkness: false,
        ray: false,
    },
    language: {
        Russian: true,
    },
    gameplay: {
        pathfinding: function() { return game.player.Settings.Pathfinding; },
        hideHelmet: function() { return game.player.Style.HideHelmet; },
    },
    ui: {
        hp: false,
        name: false,
        npc: false,
        simpleFonts: true,
        minimapObjects: false,
        allowSelfSelection: true,
        fillClaim: false,
        showMeterValues: true,
        strokeClaim: true,
        rotateMinimap: false,
        chatAttached: true,
    },
    graphics: {
        "low": false,
        "fullscreen": false,
    },
    system: {
        quitConfirm: true,
    },
    cursor: {
        dontHide: false,
        autoHighlightDoors: true,
    },
    sound: {
        playSounds: true,
        playMusic: true
    },
};
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
