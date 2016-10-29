"use strict";

main();

function main() {
    var args = parseArgs();
    var lang = localStorage.getItem("lang") || defaultLang(args);

    T.init(lang, function() {
        new Game(lang, args);
    });

    function defaultLang(args) {
        var supportedLangs = ["ru", "en"];

        var lang = args["lang"] || navigator.language.substring(0, 2);
        if (supportedLangs.includes(lang)) {
            return lang;
        }

        return supportedLangs[0];
    }

    function parseArgs() {
        return document.location.search
            .substring(1)
            .split("&")
            .reduce(function(params, param) {
                var [key, value] = param.split("=");
                params[key] = decodeURIComponent(value);
                return params;
            }, {});
    }
}
