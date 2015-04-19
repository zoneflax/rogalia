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
    lots.className = "no-drag";
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
        var e = new Entity(item.Id, item.Type);
        e.sync(item);
        e.initSprite();
        game.sortedEntities.remove(e);
        game.addEntity(e);

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
                Container.open(item.Id).panel.show();
        };

        var buy = document.createElement("button");
        buy.className = "lot-buy";
        buy.textContent = T("Buy");
        buy.onclick = function() {
            if (confirm(T("Buy") + " "+ item.Name + "?")) {
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

        var sell = document.createElement("fieldset");
        var legend = document.createElement("legend");
        legend.textContent = T("Sell item");
        sell.appendChild(legend);
        sell.appendChild(lot);
        sell.appendChild(name);
        sell.appendChild(price);
        sell.appendChild(button);

        elements.push(sell);

        function cleanUp() {
            lot.innerHTML = "";
            name.textContent = "";
            util.dom.hide(button);
            util.dom.hide(price);
        }

        if (game.player.burden) {
            var burden = game.player.burden;
            lot.use =  function(){};
            lot.id = burden.Id;
            lot.appendChild(burden.icon());
            util.dom.show(button);
            util.dom.show(price);
            name.textContent = burden.name;
            sellCleanUp = function() {
                cleanUp();
                game.player.burden = null;
            }
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
                util.dom.show(button);
                util.dom.show(price);
                lot.innerHTML = "";
                lot.appendChild(e.icon());
                name.textContent = e.name;
                //TODO: fixme and make the same for craft
                setTimeout(function(){
                    lot.onclick = sellCleanUp;
                }, 200);
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
    lots.className = "no-drag";
    var cleanUp = function() {};
    for (var type in prices) {
        (function(type) {
            var e = Entity.templates[type];
            var info = prices[type];

            var button = document.createElement("button");
            button.className = "lot-sell hidden";
            button.textContent = T("Sell");
            button.onclick = function() {
                cleanUp();
                game.network.send("sell", {Vendor: vendor.Id, Id: icon.item.entity.Id}, open);
            };

            var icon = document.createElement("div");
            icon.className = "lot-icon slot";
            var i = e.icon();
            i.classList.add("item-preview");
            icon.appendChild(i);

            icon.type = e.Type;
            icon.check = function(cursor) {
                return cursor.entity.Type == this.type;
            }
            icon.vendor = true;
            icon.use = function(item, slot) {
                cleanUp = function() {
                    item.unblock();
                    util.dom.hide(button);
                    slot.firstChild.classList.add("item-preview");
                    slot.onclick = null;
                };
                item.block();
                util.dom.show(button);
                slot.firstChild.classList.remove("item-preview");
                slot.item = item;
                setTimeout(function(){
                    slot.onclick = cleanUp;
                }, 100);

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
            util.dom.hide(button);
            util.dom.hide(price);
            util.dom.hide(quantityLabel);
            util.dom.hide(total);
        }
        var price = Vendor.createPriceInput(true);
        var lot = document.createElement("div");
        lot.className = "slot lot-icon";
        lot.vendor = vendor;

        lot.use = function(item, slot) {
            var e = Entity.get(item.id);
            util.dom.show(button);
            util.dom.show(price);
            util.dom.show(quantityLabel);
            util.dom.show(total);
            lot.type = e.Type;
            lot.innerHTML = "";
            lot.appendChild(e.icon());
            name.textContent = TS(e.Type);
            //TODO: fixme and make the same for craft
            setTimeout(function(){
                lot.onclick = sellCleanUp;
            }, 100);
            return true;
        }
        var name = document.createElement("div")
        name.className = "lot-name";

        var quantity = document.createElement("input");
        quantity.value = 1;
        var quantityLabel = document.createElement("label");
        quantityLabel.appendChild(document.createTextNode(T("Quantity") + ": "));
        quantityLabel.appendChild(quantity);
        quantityLabel.className = "lot-quantity hidden";

        var total = document.createElement("div");
        total.className = "lot-total hidden";
        total.textContent = T("Total") + ": 0";

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
        }

        var sell = document.createElement("fieldset");
        var legend = document.createElement("legend");
        legend.textContent = T("Buy item");
        sell.appendChild(legend);
        sell.appendChild(lot);
        sell.appendChild(name);
        sell.appendChild(price);
        sell.appendChild(button);
        sell.appendChild(quantityLabel);
        sell.appendChild(total);

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
    var tax = document.createElement("label");
    var info = document.createElement("div");

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

    var contents = [
        balance,
        tax,
        info,
        price,
        deposit,
        withdraw,
    ]
    var panel = new Panel("bank", "Bank", contents);
    panel.hide();

    game.network.send("get-bank-info", {}, callback);

    function callback(data) {
        if (data.Warning)
            return;
        if (!data.Done)
            return callback;
        //TODO: add price.set()
        balance.innerHTML = T("Balance") + ": ";
        balance.appendChild(Vendor.createPrice(data.Balance));

        tax.innerHTML = T("Tax") + ": ";
        tax.appendChild(Vendor.createPrice(data.Tax))

        info.innerHTML = T("Next payment") + ":<br>" + (data.NextPayment || T("never"));
        panel.show();
    }
}
