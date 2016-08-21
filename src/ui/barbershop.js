"use strict";

function Barbershop(npc) {
    var style = {
        color: dom.input(T("Color"), "#000000"),
        opacity: dom.input(T("Opacity"), "0.5"),
    };
    style.color.label.title = T("hex or rgba");
    style.opacity.label.title = "0-1";
    style.opacity.onchange = function() {
        update();
    };

    var haircuts = {
        male: [
            "beard",
            "iroquois",
            "long",
            "short",
        ],
        female: [
            "hair",
            "iroquois",
            "long",
            "short",
        ],
    };

    var panel = new Panel("barbershop", "Barbershop", [
        T("Try on"),
        makeHaircuts(),
        dom.hr(),
        makeColorPicker(),
        dom.button(T("Buy"), "buy", function() {
            window.open("http://rogalia.ru/shop/donate/", "_blank");
            // game.controller.shop.open("haircut");
        })
    ]) ;
    panel.entity = npc;
    panel.show();

    var originalStyle = game.player.Style.Hair;
    var currentHaircut = originalStyle.split("#")[0];

    panel.hooks.hide = function() {
        game.player.Style.Hair = originalStyle;
        game.player.reloadSprite();
    };

    var update = _.throttle(function update(haircut) {
        if (haircut) {
            currentHaircut = haircut;
        } else {
            haircut = currentHaircut;
        }

        game.player.Style.Hair = [
            haircut,
            style.color.value,
            "#" + style.opacity.value,
        ].join("");
        game.player.reloadSprite();
    }, 1500);


    function makeHaircuts() {
        var sex = game.player.sex();
        return dom.wrap("haircuts", haircuts[sex].map(function(haircut) {
            var preview = dom.div("preview");
            preview.style.backgroundImage = "url(assets/characters/" + sex + "/idle/hair/" + haircut + ".png)";
            preview.onclick = function() {
                update(haircut);
                dom.removeClass(".haircut.active", "active");
                wrapper.classList.add("active");
            };
            var wrapper = dom.wrap("haircut", preview);
            wrapper.style.backgroundImage = "url(assets/characters/" + sex + "/idle/naked.png";
            return wrapper;
        }));
    }

    function makeColorPicker() {
        var colorPreview = dom.div("color-preview");
        colorPreview.style.backgroundColor = style.color.value;

        var colorPicker = dom.div("color-picker");
        var picker = ColorPicker(
            colorPicker,
            function(hex, hsv, rgb) {
                style.color.value = hex;
                colorPreview.style.backgroundColor = hex;
                update();
            }
        );

        _.defer(function() {
            picker.setHex(style.color.value);
        });

        return dom.wrap(".hair-color-picker", [
            colorPicker,
            colorPreview,
            style.color.label,
            style.opacity.label,
        ]);
    }
}
