/* global _ */

"use strict";

class Professions {
    constructor() {
        this.descriptions = {};
        this._professions = {
            "Blacksmith": {
                skills: {
                    "Metalworking": 10,
                    "Mining": 5,
                }
            },
            "Tailor": {
                skills: {
                    "Tailoring": 10,
                    "Leatherworking": 5,
                }
            },
            "Alchemyst": {
                skills: {
                    Alchemy: 10,
                    Mechanics: 5,
                }
            },
            "Farmer": {
                skills: {
                    Farming: 10,
                    Fishing: 5,
                }
            },
            "Carpenter": {
                skills: {
                    Carpentry: 10,
                    Lumberjacking: 5,
                }
            },
            "Cook": {
                skills: {
                    Cooking: 10,
                    Herbalism: 5,
                }
            },
            "Hunter": {
                skills: {
                    Swordsmanship: 10,
                    Survival: 5,
                }
            },
        };
    }

    forEach(callback) {
        _.forEach(this._professions, function(prof, name) {
            callback(_.merge(prof, {
                name: name,
                desc: Professions.descriptions[name],
                mainSkill: _.keys(prof.skills)[0].toLowerCase(),
            }));
        });
    }
}
