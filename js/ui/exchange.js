"use strict";

function Exchange(npc) {
    game.network.send("get-exchange-info", {Id: npc.Id}, function callback(data) {
        var table = document.createElement("table");
        table.id = "exchange-rates-table";
        table.innerHTML = "<tr>" +
            "<th>" + T("Name") + "</th>" +
            "<th>" + T("Buy rate") + "</th>" +
            "<th>" + T("Sell rate") + "</th>" +
            "<th>" + T("Sell ingots") + "</th>" +
            "</tr>";
        Object.keys(data.Rates).forEach(function(assignation) {
            var rate = data.Rates[assignation];
            {
                var name = document.createElement("td");
                name.textContent = TS(assignation);
                name.title = T("Sold") + ": " + rate.Stats.Sold + "\n" +
                    T("Bought") + ": " + rate.Stats.Bought;
            }
            {

                var inputBuy = dom.input();
                var buttonBuy = dom.button(T("Buy"));
                buttonBuy.onclick = function() {
                    game.network.send(
                        "exchange", {Id: npc.Id, Assignation: assignation, Amount: +inputBuy.value}
                    );
                };
                var rateBuy = dom.make("td", [
                    Vendor.createPrice(rate.Buy),
                    inputBuy,
                    buttonBuy,
                ]);
            }
            {
                var inputSell = dom.input();
                var buttonSell = dom.button(T("Sell"));
                buttonSell.onclick = function() {
                    game.network.send(
                        "exchange", {Id: npc.Id, Assignation: assignation, Amount: -inputSell.value}
                    );
                };
                var rateSell = dom.make("td", [
                    Vendor.createPrice(rate.Sell),
                    inputSell,
                    buttonSell,
                ]);
            }
            {
                var inputIngots = document.createElement("input");
                var buttonIngots = document.createElement("button");
                buttonIngots.textContent = T("Sell");
                buttonIngots.onclick = function() {
                    game.network.send(
                        "exchange", {
                            Id: npc.Id,
                            Assignation: assignation,
                            Amount: +inputIngots.value,
                            Ingot: true,
                        }
                    );
                };
                var ingots = document.createElement("td");
                ingots.appendChild(inputIngots);
                ingots.appendChild(buttonIngots);
            }

            var tr = document.createElement("tr");
            tr.appendChild(name);
            tr.appendChild(rateBuy);
            tr.appendChild(rateSell);
            tr.appendChild(ingots);
            table.appendChild(tr);
        });
        var panel = new Panel("exchange", "Exchange", [table]);
        panel.show();
        return null;
    });
}
