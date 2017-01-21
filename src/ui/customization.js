/* global Panel, T, game, dom, TS */

"use strict";

function Customization() {
    const customizations = game.player.Customization || [];
    this.panel = new Panel("customization", "Customization", customizations.map(function(customization) {
        return dom.wrap(
            "slot",
            [
                TS(customization.Type),
                TS(customization.Group),
            ],
            {
                onclick: function() {
                    game.network.send("apply-customization", {Type: customization.Type, Data: customization.Data});
                }
            }
        );
    })).show();
}
