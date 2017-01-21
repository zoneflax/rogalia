/* global util, game, Panel, T, dom */

"use strict";

function Ratings() {
    util.ajax(
        game.makeServerAddr("/rating"),
        function(data) {
            var rating = JSON.parse(data);
            new Panel("ratings", "Ratings", [
                T("Top") + "20",
                dom.table(
                    [T("Name"), T("Level"), T("Skill sum")],
                    rating.map(function(player) {
                        return [player.Name, player.Lvl, util.toFixed(player.Skills)];
                    })
                ),
            ]).show();
        },
        function(error) {
            console.log(error, this);
            game.popup.alert(error);
        }
    );
}
