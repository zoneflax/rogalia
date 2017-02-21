/* global Panel, T, game, dom, TS */

"use strict";

function Customization() {
    const customizations = dom.div("customizations");
    update();
    this.panel = new Panel("customization", "Customization", [
        dom.button(T("Shop"), "", () => game.controller.shop.panel.show()),
        dom.button(T("Promo"), "", enterPromo),
        dom.hr(),
        customizations,
    ]).show();

    function update() {
        const list = game.player.Customization;
        dom.setContents(customizations, (list) ? list.map(makeCustomization) : T("No customizations"));
    }

    function makeCustomization(customization) {
        let name = customization.Group;
        let info = null;
        let enabled = false;
        switch (customization.Group) {
        case "hairstyle":
            const [type, color, opacity] = customization.Data.split("#");
            name = game.player.sex() + "-" + type;
            info = makeColorInfo("#" + color, opacity);
            enabled = (customization.Data == game.player.Style.Hair);
            break;
        case "chopper":
            info = makeColorInfo(customization.Type.split("-")[0]);
            break;
        case "chevron":
            name = customization.Data;
            enabled = (customization.Data == game.player.Style.Chevron);
            break;
        }
        return dom.wrap(
            "customization" + (enabled ? " enabled" : ""),
            [
                dom.img("assets/icons/customization/" + name + ".png"),
                info,
            ],
            {
                title: TS(name),
                onclick: function() {
                    game.network.send(
                        "apply-customization",
                        {Type: customization.Type, Data: customization.Data},
                        update
                    );
                }
            }
        );
    }

    function makeColorInfo(color, opacity = 1) {
        const preview = dom.div("preview");
        preview.style.backgroundColor = color;
        preview.style.opacity = opacity;
        return dom.wrap("info color", preview);
    }

    function enterPromo() {
        game.popup.prompt(T("Enter promocode"), "", function(promo) {
            promo && game.network.send("enter-promo", {promo});
        });
    }
}
