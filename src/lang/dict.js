/* global T, util, TS */

"use strict";
// TT translates text with substitutions
// for client:
// example 1: TT("Unlocks {lvl} lvl of the {skill} skill", {lvl: next.Name, skill: name});
// for server:
// example 2: TT("You need {need=Stoneworking} skill to craft {craft=Stone axe});
window.TT = function(text, args) {
    if (!text)
        return "";
    args = args || {};
    var substs = {};
    text = text.replace(/{(.*?)(?:=(.*?))?}/g, function(_, name, value) {
        if (name in args)
            value = args[name];
        substs[name] = (T.hasOwnProperty(name) && T[name] instanceof Function)
            ? T[name](value)
            : TS(value);
        return "{" + name + "}";
    });
    text = T(text);

    return text.replace(/{(.*?)}/g, function(_, name) {
        if (name in substs)
            return substs[name];

        var list = name.split(" ");
        var atom = list.shift();
        var index = args[atom] || 0;
        return list[index];
    });
};

window.TS = function(text) {
    return T(text, true);
};

window.T = function(text, symbol) {
    if (!util.isString(text))
        return text;
    var t = T.dict[text];
    if (t)
        return t;
    if (symbol === true) {
        text = util.symbolToString(text);
        t = T.dict[text];
        if (t)
            return t;
    }
    t = T.dict[util.ucfirst(text)];
    if (t)
        return util.lcfirst(t);
    return text;
};

T.init = function(lang, callback) {
    var scripts = [
        "dict",
        "time",
        "items",
        "help",
        "effects",
        "craft",
        "settings",
        "talks",
        "quests",
        "professions",
    ];
    var loaded = 0;
    scripts.forEach(function(script) {
        util.loadScript(
            "src/lang/" + lang + "/" + script + ".js",
            function() {
                if (++loaded == scripts.length) {
                    callback();
                }
            }
        );
    });
};

T.update = function(elem) {
    function update(elem) {
        if (elem.title)
            elem.title = T(elem.title);

        if (elem.nodeType == 3) {
            var text = elem.textContent;
            elem.textContent = T(text);
        } else if (elem.childNodes.length) {
            [].forEach.call(elem.childNodes, update);
        }
    }
    update(elem || document.body);
};
