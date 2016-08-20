"use strict";
function Help() {
    var self = this;
    var tabs = dom.tabs([
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
            contents: makeFeedback(),
        }

    ]);
    window.tabs = tabs;
    this.panel = new Panel(
        "help",
        "Help",
        [tabs]
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
        iframe.src = "http://rogalia.ru/wiki/";
        dom.setContents(contents, iframe);
    }

    function makeFeedback() {
        var textarea = dom.tag("textarea");
        return [
            dom.make("h5", T("Send a bug report or feedback")),
            textarea,
            dom.button(T("Send"), "", report),
        ];

        function report() {
            game.network.send("bugreport", {Text: textarea.value}, function() {
                textarea.value = "";
                game.alert(T("Your message is sent. Thank you."));
            });
        }
    }
}
