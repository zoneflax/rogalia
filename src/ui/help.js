/* global game, util, T, dom, Panel */

"use strict";
function Help() {
    var self = this;
    var tabs = dom.tabs([
        {
            title: T("Fight"),
            contents: makeFight(),
        },
        {
            title: T("Help"),
            init: dashboard,
        },
        {
            title: T("Wiki"),
            update: wiki,
        },
        {
            title: T("Feedback"),
            update: feedback,
        },
    ]);
    window.tabs = tabs;
    this.panel = new Panel(
        "help",
        "Help",
        tabs
    );

    function dashboard(title, contents) {
        dom.setContents(contents, [
            keys(),
        ]);
    }

    function keys(title, contents) {
        var hotkeys = _.pickBy(game.controller.hotkeys, function(hotkey) {
            return hotkey.toggle || hotkey.help;
        });
        var keyAliases = {
            9: "Tab",
            13: "Enter",
            27: "Esc",
            32: "Space",
        };
        return dom.table(
            [T("Key"), T("Description")],
            _.map(hotkeys, function(hotkey, key) {
                var desc = (hotkey.help)
                        ? T(hotkey.help)
                        : TT("Toggle {name} window", {name: hotkey.toggle});
                return [keyAliases[key] || key, desc];
            })
        );
    }

    function wiki(title, contents) {
        // TODO: make something like initOnce func for dom.tabs
        // disable update
        tabs.tabs[1].update = null;
        var iframe = dom.tag("iframe");
        iframe.resize = true;
        iframe.nwdisable = true;
        iframe.nwfaketop = true;
        iframe.src = {
            en: "http://rogalia.ru/wiki/Newbie_guide",
            ja: "http://wikiwiki.jp/rogalia/",
        }[game.lang] || "http://rogalia.ru/wiki/";
        dom.setContents(contents, iframe);
    }

    function feedback(title, contents) {
        tabs.tabs[2].update = null;
        var iframe = dom.tag("iframe");
        iframe.resize = true;
        iframe.nwdisable = true;
        iframe.nwfaketop = true;
        iframe.src = {
            ja: "https://steamcommunity.com/app/528460/discussions/3/",
        }[game.lang] || "https://steamcommunity.com/app/528460/discussions/";
        dom.setContents(contents, iframe);

        // var textarea = dom.tag("textarea");
        // return [
        //     dom.make("h5", T("Send a bug report or feedback")),
        //     textarea,
        //     dom.button(T("Send"), "", report),
        // ];

        // function report() {
        //     var msg = {Text: textarea.value};
        //     textarea.value = "";
        //     game.popup.alert(T("Your message is sent. Thank you."));
        //     game.network.send("bugreport", msg);
        // }
    }

    function makeFight() {
        var combos = _.map(game.controller.fight.combo.combos, function(combo) {
            const help = T.help.combos[combo.name];
            return [
                util.ucfirst(T(combo.name)),
                game.controller.fight.combo.makeCombo(combo, "", false),
                `${help.desc} (${help.effect})`,
            ];
        });
        return dom.scrollable("help-fight", T.help.fight(combos));

    }
}
