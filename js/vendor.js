"use strict";
function Vendor() {

}

Vendor.panel = null;
Vendor.createPrice = function(cost) {
    cost = parseInt(cost) || 0;

    var negative = false;
    if (cost < 0) {
        negative = true;
        cost = -cost;
    }

    var s = cost % 100;
    cost -= s;
    cost /= 100;
    var g = cost % 100;
    cost -= g;
    cost /= 100;
    var p = cost;

    var silver = document.createElement("span");
    silver.className = "silver";
    silver.textContent = s + "s";
    silver.title = T("Silver");

    var gold = document.createElement("span");
    gold.className = "gold";
    gold.textContent = g + "g";
    gold.title = T("Gold");

    var platinum = document.createElement("span");
    platinum.className = "platinum";
    platinum.textContent = p + "p";
    platinum.title = T("Platinum");

    var price = document.createElement("span");
    price.className = "price";
    if (negative)
        price.classList.add("negative");
    price.appendChild(platinum);
    price.appendChild(gold);
    price.appendChild(silver);
    return price;
};

Vendor.createPriceInput = function(hidden) {
    var platinum = document.createElement("input");
    platinum.className = "platinum";
    platinum.title = T("Platinum");
    platinum.value = 0;

    var gold = document.createElement("input");
    gold.className = "gold";
    gold.title = T("gold");
    gold.value = 0;

    var silver = document.createElement("input");
    silver.className = "silver";
    silver.title = T("Silver");
    silver.value = 0;

    var price = document.createElement("div");
    price.className = "lot-price price" + (hidden ? " hidden" : "");
    price.appendChild(platinum);
    price.appendChild(document.createTextNode("p"));
    price.appendChild(gold);
    price.appendChild(document.createTextNode("g"));
    price.appendChild(silver);
    price.appendChild(document.createTextNode("s"));

    price.cost = function() {
        return parseInt(platinum.value) * 10000 +
            parseInt(gold.value) * 100 +
            parseInt(silver.value);
    };
    return price;
}
Vendor.buy = function(data) {
    var vendor = this;
    var open = Vendor.buy.bind(this);

    if (!data.Done) {
        return open;
    }


    var items = data.items || [];
    var prices = data.prices || {};

    var lots = document.createElement("ul");
    lots.id = "lot-list";
    function byType(a, b) {
        if (a.Type != b.Type)
            return (a.Type > b.Type) ? +1 : -1;
        else
            return byQuality(a, b);
    }
    function byQuality(a, b) {
        if (a.Quality != b.Quality)
            return b.Quality - a.Quality;
        else
            return byPrice(a, b);
    }
    function byPrice(a, b) {
        return prices[b.Id] - prices[a.Id];
    }

    items.sort(byType).forEach(function(item) {
        var e = new Entity(item.Type, item.Id);
        e.sync(item);
        e.initSprite();
        game.sortedEntities.remove(e);
        game.addEntity(e);
        if (e.inContainer()) {
            return;
        }


        var icon = document.createElement("div");
        icon.className = "lot-icon slot";
        icon.appendChild(e.icon());

        var name = document.createElement("div");
        name.className = "lot-name";
        name.textContent = e.name;

        var price = document.createElement("div");
        price.className = "lot-price";
        //price.appendChild(document.createTextNode(T("Price") + ": "));
        price.appendChild(Vendor.createPrice(prices[e.Id]));

        var info = document.createElement("button");
        info.className = "lot-info";
        info.textContent = "?";
        info.onclick = function() {
            e.showInfo();
            if (e.Props.Slots)
                Container.show(e);
        };

        var buy = document.createElement("button");
        buy.className = "lot-buy";
        buy.textContent = T("Buy");
        buy.onclick = function() {
            if (confirm(T("Buy") + " "+ e.name + "?")) {
                game.network.send("buy", {Id: item.Id, Vendor: vendor.Id}, open);
            }
        };

        var lot = document.createElement("li");
        lot.className = "lot";
        lot.appendChild(icon);
        lot.appendChild(name);
        lot.appendChild(price);
        lot.appendChild(buy);
        lot.appendChild(info);

        lots.appendChild(lot);
    });

    var elements = [lots];

    var sellCleanUp = function() {};
    if (game.player.IsAdmin || game.player.Id == this.Owner) {
        var price = Vendor.createPriceInput(true);

        var lot = document.createElement("div");
        lot.className = "slot lot-icon";
        lot.vendor = vendor;

        var name = document.createElement("div");
        name.className = "lot-name";

        var button = document.createElement("button");
        button.className = "lot-sell hidden";
        button.textContent = T("Sell");
        button.onclick = function() {
            sellCleanUp();
            game.sortedEntities.remove(Entity.get(lot.id));
            game.network.send(
                "buy-add",
                {
                    Id: parseInt(lot.id),
                    Cost: price.cost(),
                    Vendor: vendor.Id
                },
                open
            );
        };

        var sell = document.createElement("div");
        var legend = document.createElement("div");
        legend.textContent = T("Sell item");
        sell.appendChild(legend);
        sell.appendChild(lot);
        sell.appendChild(name);
        sell.appendChild(price);
        sell.appendChild(button);

        elements.push(dom.hr());
        elements.push(sell);

        var cleanUp = function() {
            lot.innerHTML = "";
            name.textContent = "";
            dom.hide(button);
            dom.hide(price);
        };

        if (game.player.burden) {
            var burden = game.player.burden;
            lot.use =  function(){};
            lot.id = burden.Id;
            lot.appendChild(burden.icon());
            dom.show(button);
            dom.show(price);
            name.textContent = burden.name;
            sellCleanUp = function() {
                cleanUp();
                game.player.burden = null;
            };
        } else {
            sellCleanUp = function() {
                if (lot.item)
                    lot.item.unblock();
                lot.onclick = null;
                cleanUp();
            };
            lot.use = function(item, slot) {
                item.block();
                var e = Entity.get(item.id);
                lot.id = e.Id;
                lot.item = item;
                dom.show(button);
                dom.show(price);
                lot.innerHTML = "";
                lot.appendChild(e.icon());
                name.textContent = e.name;
                lot.onmousedown = sellCleanUp;
                return true;
            };
        }
    }

    if (Vendor.panel)
        Vendor.panel.close();
    Vendor.panel = new Panel(
        "vendor",
        vendor.Name,
        elements
    );
    Vendor.panel.hooks.hide = sellCleanUp;
    Vendor.panel.show();

    return null;
}

//TODO: remove paste
Vendor.sell = function(data) {
    var vendor = this;
    var open = Vendor.sell.bind(this);

    if (!data.Done) {
        return open;
    }
    var prices = data.prices || {};
    var lots = document.createElement("ul");
    lots.id = "lot-list";
    var cleanUp = function() {};
    for (var type in prices) {
        (function(type) {
            var e = Entity.templates[type];
            var info = prices[type];

            var button = document.createElement("button");
            button.className = "lot-sell";

            var canBeSold = [];
            Container.forEach(function(container) {
                if (!container.entity.belongsTo(game.player))
                    return;
                container.forEach(function(slot) {
                    var entity = slot.entity;
                    if (entity && entity.Type == type) {
                        canBeSold.push(entity);
                    }
                });
            });
            if (canBeSold.length == 0)
                dom.hide(button);

            button.textContent = T("Sell");
            button.onclick = function() {
                if (icon.entity) {
                    cleanUp();
                    game.network.send("sell", {Vendor: vendor.Id, Id: icon.entity.Id}, open);
                    return;
                }
                var quantity = dom.input(T("Quantity"), canBeSold.length, "number");
                quantity.min = 1;
                quantity.max = canBeSold.length;
                quantity.style.width = "auto";
                var sell = dom.button(T("Sell"));
                sell.onclick = function() {
                    var list = canBeSold.slice(0, quantity.value).map(function(entity) {
                        return entity.Id;
                    });
                    game.network.send("sell", {Vendor: vendor.Id, List: list}, open);
                };
                var prompt = new Panel("prompt", T("Sell"), [quantity.label, sell]);
                prompt.show();
            };

            var icon = document.createElement("div");
            icon.className = "lot-icon slot";
            var i = e.icon();
            i.classList.add("item-preview");
            icon.appendChild(i);

            icon.type = e.Type;
            icon.check = function(cursor) {
                return cursor.entity.Type == this.type;
            };
            icon.vendor = true;
            icon.use = function(entity, to) {
                var slot = Container.get(entity.findContainer()).findSlot(entity);
                cleanUp = function() {
                    slot.unlock();
                    if (canBeSold.length == 0)
                        dom.hide(button);
                    to.firstChild.classList.add("item-preview");
                    to.onclick = null;
                };
                slot.lock();
                dom.show(button);
                to.firstChild.classList.remove("item-preview");
                to.entity = entity;
                to.onmousedown = cleanUp;
                return true;
            };


            var name = document.createElement("div");
            name.className = "lot-name";
            name.textContent = TS(e.Type);

            var quantity = document.createElement("div");
            quantity.textContent = T("Quantity") + ": " + info.Quantity;

            var price = document.createElement("div");
            price.className = "lot-price";
            price.appendChild(Vendor.createPrice(info.Cost));

            var lot = document.createElement("li");
            lot.className = "lot";
            lot.appendChild(icon);
            lot.appendChild(name);
            lot.appendChild(quantity);
            lot.appendChild(price);
            if (game.player.IsAdmin || game.player.Id == vendor.Owner) {
                var cancel = document.createElement("button");
                cancel.className = "lot-cancel";
                cancel.textContent = T("×");
                cancel.title = T("Cancel buying and return money");
                cancel.onclick = function() {
                    game.network.send("undo-buy", {Type: type, Vendor: vendor.Id}, open);
                };
                lot.appendChild(cancel);
            }
            lot.appendChild(button);


            lots.appendChild(lot);
        })(type);
    }


    var elements = [lots];

    var sellCleanUp = function() {};
    if (game.player.IsAdmin || game.player.Id == this.Owner) {
        sellCleanUp = function() {
            lot.innerHTML = "";
            name.textContent = "";
            dom.hide(button);
            dom.hide(price);
            dom.hide(quantityLabel);
        };
        var price = Vendor.createPriceInput(true);
        var lot = document.createElement("div");
        lot.className = "slot lot-icon";
        lot.vendor = vendor;

        lot.use = function(entity, _) {
            dom.show(button);
            dom.show(price);
            dom.show(quantityLabel);
            lot.type = entity.Type;
            lot.innerHTML = "";
            lot.appendChild(entity.icon());
            name.textContent = TS(entity.Type);
            lot.onmousedown = sellCleanUp;
            return true;
        };
        var name = document.createElement("div");
        name.className = "lot-name";

        var quantity = document.createElement("input");
        quantity.value = 1;
        var quantityLabel = document.createElement("label");
        quantityLabel.appendChild(document.createTextNode(T("Quantity") + ": "));
        quantityLabel.appendChild(quantity);
        quantityLabel.className = "lot-quantity hidden";

        var button = document.createElement("button");
        button.className = "lot-sell hidden";
        button.textContent = T("Buy");
        button.onclick = function() {
            sellCleanUp();
            game.network.send(
                "sell-add",
                {
                    Type: lot.type,
                    Cost: price.cost(),
                    Quantity: +quantity.value,
                    Vendor: vendor.Id
                },
                open
            );
        };

        var sell = document.createElement("div");
        var legend = document.createElement("div");
        legend.textContent = T("Buy up");
        sell.appendChild(legend);
        sell.appendChild(lot);
        sell.appendChild(name);
        sell.appendChild(price);
        sell.appendChild(button);
        sell.appendChild(quantityLabel);

        elements.push(dom.hr());
        elements.push(sell);
    }

    if (Vendor.panel)
        Vendor.panel.close();
    Vendor.panel = new Panel(
        "vendor",
        vendor.Name,
        elements
    );
    Vendor.panel.hooks.hide = function() {
        sellCleanUp();
        cleanUp();
    }
    Vendor.panel.show();
    return null
}

function Bank() {
    var balance = document.createElement("label");
    var price = Vendor.createPriceInput();

    var deposit = document.createElement("button");
    deposit.textContent = T("Deposit");
    deposit.onclick = function() {
        game.network.send("deposit", {"Cost": price.cost()}, callback);
    };

    var withdraw = document.createElement("button");
    withdraw.textContent = T("Withdraw");
    withdraw.onclick = function() {
        game.network.send("withdraw", {"Cost": price.cost()}, callback);
    };

    var claimRent = document.createElement("label");
    var claimPaidTill = document.createElement("label");
    var claimLastPaid = document.createElement("label");
    var claimPay = document.createElement("button");
    claimPay.textContent = T("Pay");
    claimPay.onclick = function() {
        if (confirm(T("Confirm?"))) {
            game.network.send("pay-for-claim", {}, callback);
        }
    };

    var claim = document.createElement("div");
    claim.appendChild(document.createTextNode(T("Claim")));
    claim.appendChild(claimRent);
    claim.appendChild(claimPaidTill);
    claim.appendChild(claimLastPaid);
    claim.appendChild(claimPay);

    var vault = document.createElement("div");

    var contents = [
        balance,
        dom.hr(),
        price,
        deposit,
        withdraw,
        dom.hr(),
        claim,
        dom.hr(),
        vault,
    ];
    var panel = new Panel("bank", "Bank", contents);
    panel.hide();

    game.network.send("get-bank-info", {}, callback);

    function date(unixtime) {
        var span = document.createElement("span");
        if (unixtime > 0)
            span.textContent = util.date.human(new Date(unixtime * 1000));
        else
            span.textContent = "-";
        return span;
    }

    function callback(data) {
        if (data.Warning)
            return;
        if (!data.Done)
            return callback;
        //TODO: add price.set()
        balance.innerHTML = T("Balance") + ": ";
        balance.appendChild(Vendor.createPrice(data.Bank.Balance));

        var claim = data.Bank.Claim;
        claimRent.innerHTML = T("Rent") + ": ";
        claimRent.appendChild(Vendor.createPrice(claim.Cost));


        claimPaidTill.innerHTML = T("Paid till") + ": ";
        claimPaidTill.appendChild(date(claim.PaidTill));

        claimLastPaid.innerHTML = T("Last paid") + ": ";
        claimLastPaid.appendChild(date(claim.LastPaid));

        vault.innerHTML = "";
        data.Bank.Vault.forEach(function(vaultSlot, i) {
            var slot = document.createElement("div");
            slot.className = "slot";
            if (vaultSlot.Unlocked) {
                var entity = Entity.get(vaultSlot.Id);
                slot.appendChild(entity.icon());
                slot.onclick = function() {
                    Container.show(entity);
                };
            } else {
                slot.classList.add("plus");
                slot.onclick = function() {
                    var cost = Math.pow(100, i);
                    if (confirm(TT("Buy slot {cost} gold?", {cost: cost}))) {
                        game.network.send("buy-bank-vault-slot", {}, callback);
                    };
                };
            }
            vault.appendChild(slot);

        });
        // //TODO: remove items on panel close?


        panel.show();
    };
}

function Exchange() {
    game.network.send("get-exchange-info", {}, function callback(data) {
        if (data.Warning)
            return null;
        if (!data.Done)
            return callback;
        var table = document.createElement("table");
        table.id = "exchange-rates-table";
        table.innerHTML = "<tr>" +
            "<th>" + T("Rate") + "</th>" +
            "<th>" + T("Rate") + "</th>" +
            "<th>" + T("Buy") + "</th>" +
            "<th>" + T("Rate") + "</th>" +
            "<th>" + T("Sell") + "</th>" +
            "<th>" + T("Sell ingots") + "</th>" +
            "</tr>";
        Object.keys(data.Rates).forEach(function(assignation) {
            var rate = data.Rates[assignation];
            {
                var name = document.createElement("td");
                name.textContent = T(assignation);
                name.title = T("Sold") + ": " + rate.Stats.Sold + "\n" +
                    T("Bought") + ": " + rate.Stats.Bought;
            }
            {
                var rateBuy = document.createElement("td");
                rateBuy.appendChild(Vendor.createPrice(rate.Buy));
            }
            {
                var inputBuy = document.createElement("input");
                var buttonBuy = document.createElement("button");
                buttonBuy.textContent = T("Buy");
                buttonBuy.onclick = function() {
                    game.network.send(
                        "exchange", {Assignation: assignation, Amount: +inputBuy.value}
                    );
                };

                var buy = document.createElement("td");
                buy.appendChild(inputBuy);
                buy.appendChild(buttonBuy);
            }
            {
                var rateSell = document.createElement("td");
                rateSell.appendChild(Vendor.createPrice(rate.Sell));
            }
            {
                var inputSell = document.createElement("input");
                var buttonSell = document.createElement("button");
                buttonSell.textContent = T("Sell");
                buttonSell.onclick = function() {
                    game.network.send(
                        "exchange", {Assignation: assignation, Amount: -inputSell.value}
                    );
                };


                var sell = document.createElement("td");
                sell.appendChild(inputSell);
                sell.appendChild(buttonSell);
            }
            {
                var inputIngots = document.createElement("input");
                var buttonIngots = document.createElement("button");
                buttonIngots.textContent = T("Sell");
                buttonIngots.onclick = function() {
                    game.network.send(
                        "exchange", {
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
            tr.appendChild(buy);
            tr.appendChild(rateSell);
            tr.appendChild(sell);
            tr.appendChild(ingots);
            table.appendChild(tr);
        });
        var panel = new Panel("exchange", "Exchange", [table]);
        panel.show();
        return null;
    });
};
