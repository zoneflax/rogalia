"use strict";

var game;
main();

function main() {
    var lang = localStorage.getItem("lang") || defaultLang();

    T.init(lang, function() {
        game = new Game(lang);
    });

    function defaultLang() {
        if (document.location.search.indexOf("en") != -1)
            return "en";
        if (navigator.language.substring(0, 2) == "en")
            return "en";
        return "ru";
    }
}
