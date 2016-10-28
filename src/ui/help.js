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
        },
        {
            title: T("Fight"),
            contents: makeFight(),
        },
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
                game.popup.alert(T("Your message is sent. Thank you."));
            });
        }
    }

    function makeFight() {
        var combos = game.controller.fight.combo.combos;
        return dom.wrap("", [
            dom.make("h3", T("Melee fighting")),
            dom.make("p", "Бафы активируются попаданием по противнику (кроме Ня)."),
            dom.make("p", "Ирими дает небольшое ускорение если на персонаже висит любой баф."),
            dom.table(
                [T("Name"), T("Combo"), T("Description")],
                _.map(combos, function(combo) {
                    return [
                        T(combo.name),
                        combo.actions.split("-").map(T).join(" "),
                        combo.desc,
                    ];
                })
            ),
            dom.make("h3", T("Ranged fighting")),
            dom.make("p", "Для использования дальнобойного оружия вторая рука должна быть пустой."),
            dom.make("p", "Для выстрела используются снаряды, в зависимости от оружия."),
            dom.make("p", "На арене и в пвп инстансах снаряды не тратятся."),
            dom.wrap("", [
                "У каждого дальнобойнего оружия есть следующие характеристики:",
                dom.ul([
                    "Максимальная дальность: если цель вне этого радиуса, стрелять по ней нельзя.",
                    "Эффективная дальность: внутри этого радиуса точность максимальна.",
                    "Скорострельность: с какой скоростью выпускается снаряд",
                    "Тип снаряда: например, камни, стрелы, атомы",
                    "Скорость снаряда: скорость с которой снаряд дотелит до цели.",
                ])
            ]),
            dom.make("p", "Цель может уклонится от попадания, выйдя из небольшого радиуса, по которому был нанесен выстрел."),
            dom.make("p", "Чем дальше цель от эффективной зоны, тем вы меньше шанс попадания."),
        ]);
    }
}
