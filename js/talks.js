"use strict";

var Talks = {
    npcs: {},
};

Talks.get = function(type, faction, sex) {
    var result = {
        actions: {},
        talks: [],
    };

    var typeData = Talks.npcs[type];
    if (!typeData)
        return result;

    result.actions = typeData["actions"] || {};

    var factionData = typeData[faction] || typeData["default"];
    if (!factionData)
        return result;

    result.talks = factionData[sex] || factionData["male"];
    return result;
};
