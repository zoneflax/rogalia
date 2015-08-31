"use strict";
var CELL_SIZE = 32;
var FONT_SIZE = 14;
var DEFAULT_CLIENT_WIDTH = 1280;
var DEFAULT_CLIENT_HEIGHT = 720;
var LOBBY_X = 85;
var LOBBY_Y = 15;

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
        chatBalloons: true,
        showAttackRadius: true,
    },
    graphics: {
        "low": false,
        "fullscreen": false,
    },
    system: {
        quitConfirm: false,
    },
    cursor: {
        dontHide: false,
        autoHighlightDoors: false,
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
