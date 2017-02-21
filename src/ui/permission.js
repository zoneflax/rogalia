/* global dom, game */

"use strict";

class Permission {
    static make(id, perm) {
        const perms = _.range(0, 8).map(function(i) {
            const bit = 1 << i;
            const color = dom.div(`perm-color perm-color-${i}`);
            const elem = dom.wrap("perm", [
                color,
                dom.img("assets/icons/key.png")
            ], {
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
            return elem;
        });
        return dom.wrap("perms", perms);
    }
}
