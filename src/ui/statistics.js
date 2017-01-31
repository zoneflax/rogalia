/* global Panel, dom, game, T, util, TT */

"use strict";

function Statistics() {
    game.network.send("get-stats", {}, function(data) {
        function row(title, text) {
            var tr = dom.tag("tr");
            dom.append(tr, [
                dom.tag("td", "", {text: T(title)}),
                dom.tag("td", "", {text: T(text)}),
            ]);
            return tr;
        }
        function table(header, rows) {
            var table = dom.tag("table", "stats-table");
            if (header) {
                var th = dom.tag("th", "", {text: T(header)});
                th.colSpan = 2;
                table.appendChild(th);
            }
            for (var title in rows) {
                var value = rows[title];
                if (typeof value == "number")
                    value = util.monetary(value);
                if (value < 0)
                    value = -value;
                table.appendChild(row(title, value));
            }
            return table;
        }
        var stats = data.Stats;
        var tabs = [
            {
                title: TT("general", {sex: 1}),
                contents: [
                    table("", {
                        "Registered": stats.Registered.replace("T", " ").substring(0, 16),
                        "Online (hours)": util.toFixed(stats.Online / (60 * 60)),
                        "Kills": stats.Kills,
                        "Death": stats.Death,
                    })
                ],
            },
            {
                title: T("PVE"),
                contents: [
                    table("", {
                        "Kills": stats.Pve.Kills,
                        "Death": stats.Pve.Death,
                    }),
                    table("Lost", {
                        "LP": stats.Pve.Lost.LP,
                        "Protein": stats.Pve.Lost.Protein,
                        "Fat": stats.Pve.Lost.Fat,
                        "Carbohydrate": stats.Pve.Lost.Carbohydrate,
                        "Phosphorus": stats.Pve.Lost.Phosphorus,
                        "Calcium": stats.Pve.Lost.Calcium,
                        "Magnesium": stats.Pve.Lost.Magnesium,
                    })
                ],
            },
            {
                title: T("PVP"),
                contents: [
                    table("Kills", {
                        "PK": stats.Pvp.Kills.Pk,
                        "APK": stats.Pvp.Kills.Apk,
                        "PVP": stats.Pvp.Kills.Pvp,
                        "Arena": stats.Pvp.Kills.Arena,
                        "Total": stats.Pvp.Kills.Total,
                    }),
                    table("Death", {
                        "PK": stats.Pvp.Death.Pk,
                        "PVP": stats.Pvp.Death.Pvp,
                        "Arena": stats.Pvp.Death.Arena,
                        "Total": stats.Pvp.Death.Total,
                    }),
                    table("Lost", {
                        "LP": stats.Pvp.Lost.LP,
                        "Protein": stats.Pvp.Lost.Protein,
                        "Fat": stats.Pvp.Lost.Fat,
                        "Carbohydrate": stats.Pvp.Lost.Carbohydrate,
                        "Phosphorus": stats.Pvp.Lost.Phosphorus,
                        "Calcium": stats.Pvp.Lost.Calcium,
                        "Magnesium": stats.Pvp.Lost.Magnesium,
                    }),
                    table("Destroyed", {
                        "LP": stats.Pvp.Destoyed.LP,
                        "Protein": stats.Pvp.Destoyed.Protein,
                        "Fat": stats.Pvp.Destoyed.Fat,
                        "Carbohydrate": stats.Pvp.Destoyed.Carbohydrate,
                        "Phosphorus": stats.Pvp.Destoyed.Phosphorus,
                        "Calcium": stats.Pvp.Destoyed.Calcium,
                        "Magnesium": stats.Pvp.Destoyed.Magnesium,
                    })
                ],
            },
        ];
        new Panel("statistics", "Statistics", dom.tabs(tabs)).show();
    });
}
