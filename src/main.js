"use strict";

main();

function main() {
    var lang = localStorage.getItem("lang") || defaultLang();

    T.init(lang, function() {
        new Game(lang);
    });

    function defaultLang() {
        if (document.location.search.indexOf("en") != -1)
            return "en";
        if (navigator.language.substring(0, 2) == "en")
            return "en";
        return "ru";
    }

    if (document.location.href.match("localhost")) {
        window.less = {
            env: "development",
            useFileCache: false,
        };

        util.loadScript("//cdnjs.cloudflare.com/ajax/libs/less.js/2.7.1/less.min.js").onload = function() {
            var refresh = less.refresh;
            less.refresh = function() {
                var link = dom.tag("link");
                link.rel = "stylesheet/less";
                link.href = "main.less";
                dom.insert(link);
                less.sheets.push(link);
                refresh.call(less);
                less.refresh = refresh;
            };
        };
    }
}
