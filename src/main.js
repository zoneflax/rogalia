/* global T, Game, config, util, gameStorage */

"use strict";

main();

function main() {
    const args = parseArgs();
    const lang = gameStorage.getItem("lang") || defaultLang(args);

    if (args["skewer"]) {
        util.loadScript("http://localhost:8888/skewer");
    }

    T.init(lang, function() {
        new Game(lang, args);
    });

    function defaultLang(args) {

        // force ru for vk
        if (window.name.indexOf("fXD") == 0) {
            return "ru";
        }

        const lang = args["lang"] || navigator.language.substring(0, 2);
        if (config.ui.language().includes(lang)) {
            return lang;
        }

        return config.ui.language()[0];
    }

    function parseArgs() {
        return document.location.search
            .substring(1)
            .split("&")
            .reduce((params, param) => {
                const [key, value] = param.split("=");
                params[key] = decodeURIComponent(value);
                return params;
            }, {});
    }
}
