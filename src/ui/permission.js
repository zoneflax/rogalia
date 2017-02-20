/* global dom, game */

"use strict";

class Permission {
    static make(id, perm) {
        const perms = Permission.colors.map(function(color, i) {
            const bit = 1 << i;
            const elem = dom.div("perm", {
                onclick: function() {
                    perm = (elem.classList.contains("enabled"))
                        ? perm & ~bit
                        : perm | bit;
                    game.network.send("set-perm", {id, perm}, function() {
                        elem.classList.toggle("enabled");
                    });
                },
            });
            if (perm & bit) {
                elem.classList.add("enabled");
            }
            elem.style.backgroundColor = color;
            return elem;
        });
        return dom.wrap("perms", perms);
    }
}

Permission.colors = [
    "white",
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
];
