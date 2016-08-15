"use strict";

function Exchange(npc) {
    game.network.send("get-exchange-info", {Id: npc.Id}, function callback(data) {
        var table = dom.table([
            T("Name"),
            T("Buy rate"),
            T("Sell rate"),
            T("Sell ingots")
        ]);
        dom.setClassOrId(table, "#exchange-rates-table");

        Object.keys(data.Rates).forEach(function(assignation) {
            var rate = data.Rates[assignation];
            {
                var name = dom.tag("td", "", {
                    text :  TS(assignation),
                    title : T("Sold") + ": " + rate.Stats.Sold + "\n" + T("Bought") + ": " + rate.Stats.Bought
                });

                var inputBuy = dom.input();
                var buttonBuy = dom.button(T("Buy"), "", function() {
                    game.network.send(
                        "exchange",
                        {
                            Id: npc.Id,
                            Assignation: assignation,
                            Amount: +inputBuy.value
                        }
                    );
                });
                var rateBuy = dom.make("td", [
                    Vendor.createPrice(rate.Buy),
                    inputBuy,
                    buttonBuy,
                ]);
            }
            {
                var inputSell = dom.input();
                var buttonSell = dom.button(T("Sell"), "" , function() {
                    game.network.send(
                        "exchange", {Id: npc.Id, Assignation: assignation, Amount: -inputSell.value}
                    );
                });
                var rateSell = dom.make("td", [
                    Vendor.createPrice(rate.Sell),
                    inputSell,
                    buttonSell,
                ]);
            }
            {
                var inputIngots = dom.input();
                var buttonIngots = dom.button(T("Sell"), "", function() {
                    game.network.send(
                        "exchange", {
                            Id: npc.Id,
                            Assignation: assignation,
                            Amount: +inputIngots.value,
                            Ingot: true,
                        }
                    );
                });
                var ingots = dom.make("td", [inputIngots, buttonIngots]);
            }

            var tr = dom.make("tr", [name, rateBuy, rateSell, ingots]);
            dom.append(table, [tr]);
        });
        var panel = new Panel("exchange", "Exchange", [table]);
        panel.show();
        return null;
    });
}
