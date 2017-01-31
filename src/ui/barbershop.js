/* global Panel, dom, game, T */

"use strict";

function Barbershop(selectHaircut, onupdate) {
    var style = {
        color: dom.input(T("Color"), "#000000"),
        opacity: dom.input(T("Opacity"), "0.5"),
    };
    style.color.label.title = T("hex or rgba");
    style.opacity.label.title = "0-1";
    style.opacity.onchange = function() {
        update();
    };

    var originalStyle = game.player.Style.Hair;
    var currentHaircut = originalStyle.split("#")[0];

    var update = _.throttle(function update(haircut) {
        if (haircut) {
            currentHaircut = haircut;
        } else {
            haircut = currentHaircut;
        }

        var hairstyle = [
            haircut,
            style.color.value,
            "#" + style.opacity.value,
        ].join("");

        onupdate(hairstyle);

        game.player.Style.Hair = hairstyle;
        game.player.reloadSprite();
    }, 1500);
    update(selectHaircut);

    var panel = new Panel("barbershop", "Barbershop", [
        T("Select hair color"),
        dom.hr(),
        makeColorPicker(),
        dom.button(T("Ok"), "", function() {
            game.controller.shop.panel.show();
            panel.close();
        }),
    ]);


    panel.show();

    panel.hooks.hide = function() {
        game.player.Style.Hair = originalStyle;
        game.player.reloadSprite();
    };

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
