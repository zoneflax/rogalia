/* global game */

"use strict";

var CELL_SIZE = 32;
var FONT_SIZE = 14;
var DEFAULT_CLIENT_WIDTH = 1280;
var DEFAULT_CLIENT_HEIGHT = 720;
var LOBBY_X = 85;
var LOBBY_Y = 15;

var config = {
    character: {
        // pathfinding: function() { return game.player.Settings.Pathfinding; },
        hideHelmet: function() { return game.player.Style.HideHelmet; },
        rotateWasd: false,
        autoTarget: true,
    },
    ui: {
        language: function(current) {
            return  (current)
                ? game.lang
                : ["en", "ru", "ja"];
        },
        hp: true,
        name: true,
        npc: true,
        simpleFonts: false,
        allowSelfSelection: false,
        showMeterValues: true,
        chatAttached: true,
        chatBalloons: true,
        showAttackRadius: true,
        fillClaim: false,
        strokeClaim: true,
        comboHelper: true,
    },
    graphics: {
        // low: false,
        autoHighlightDoors: false,
        snowflakes: false,
        movingSpace: false,
        centerScreen: true,
        autoHideWalls: true,
        mapGrid: false,
    },
    sound: {
        playSound: true,
        playMusic: true,
        jukebox: true,
        chatNotifications: false,
        soundVolume: 0.50,
        musicVolume: 0.25,
        voiceVolume: 1.00,
    },
};

var debug = {
    map: {
        world: true,
        darkness: false,
        simpleDarkness: false,
        ray: false,
        position: false,
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
    network: {
        length: false,
        data: false,
    },
};
