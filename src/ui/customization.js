/* global Panel, T, game, dom, TS */

"use strict";

function Customization() {
    const customizations = game.player.Customization || [];
    this.panel = new Panel("customization", "Customization", customizations.map(function(customization) {
        let name = customization.Group;
        let info = null;
        switch (customization.Group) {
        case "hairstyle":
            const [type, color, opacity] = customization.Data.split("#");
            name = game.player.sex() + "-" + type;
            info = makeColorInfo("#" + color, opacity);
            break;
        case "chopper":
            info = makeColorInfo(customization.Type.split("-")[0]);
            break;
        }
        return dom.wrap(
            "customization",
            [
                dom.img("assets/icons/customization/" + name + ".png"),
                info,
            ],
            {
                title: TS(name),
                onclick: function() {
                    game.network.send(
                        "apply-customization",
                        {Type: customization.Type, Data: customization.Data}
                    );
                }
            }
        );
    })).show();

    function makeColorInfo(color, opacity = 1) {
        const preview = dom.div("preview");
        preview.style.backgroundColor = color;
        preview.style.opacity = opacity;
        return dom.wrap("info color", preview);
    }
}
