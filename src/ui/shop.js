/* global dom, game, TS, Panel, T */

"use strict";

function Shop() {
    var self = this;
    var currency = (cost) => "$" + cost;

    this.tabs = null;

    var buyButton = null;

    var loaded = false;
    var onload = function(){};

    // TODO: remove me;
    // clear old data
    gameStorage.removeItem("panels.shop");
    playerStorage.removeItem("panels.shop");

    this.panel = new Panel("shop", "Shop", [], {
        show: function() {
            if (loaded) {
                onload();
            } else {
                load(function() {
                    loaded = true;
                    onload();
                });
            }
        },
    }).setTemporary(true);

    this.sync = function(data) {
        const input = dom.tag("input");
        input.value = data.Url;
        input.readonly = true;
        new Panel("steam-payment", "Steam", [
            dom.wrap("urlbar", [
                input,
                dom.button(T("Open"), "", () => window.open(data.Url, "_blank")),
            ]),
            dom.hr(),
            T("For security reasons, Steam may ask you to enter your login and password."),
            dom.hr(),
            dom.iframe(data.Url),
        ]).show();
    };

    this.search = function(pattern) {
        onload = function() {
            search(pattern);
            onload = function(){};
        };
        this.panel.show();
    };

    var cards = [];

    function load(onload) {
        game.network.send("shop-list", {}, function(data) {
            var tabs = [
                {
                    title: T("Character"),
                },
                {
                    title: T("Mounts"),
                },
                {
                    title: T("Walls"),
                },
                {
                    title: T("Items"),
                },
            ];

            var groups = _.map(_.groupBy(data.Products, ".Group"), function(products) {
                return _.orderBy(products, ".Tag");
            });

            _.forEach(groups, function(group, index) {
                var tag = "";
                var contents = [];
                _.forEach(group, function(product) {
                    if (tag != product.Tag) {
                        tag = product.Tag;
                        contents.push(dom.wrap("product-tag", TS(tag)));
                    }
                    var card = dom.wrap("product-card product-card-" + tag, [
                        dom.wrap("product-info", [
                            productName(product),
                            dom.wrap("product-cost", currency(product.Cost)),
                        ]),
                    ]);
                    card.name = product.Name;
                    card.tab = tabs[index];
                    card.style.backgroundImage = "url(assets/shop/" + product.Name + "/preview.png)";
                    card.onclick = () => { openCard(product); };
                    cards.push(card);
                    contents.push(card);
                });
                tabs[index].contents = dom.wrap("products", contents);
            });
            self.tabs = dom.tabs(tabs);
            self.panel.setContents(self.tabs);
            onload();
        });
    }

    function openCard(product) {
        buyButton = dom.button(T("Buy"), "product-buy", function() {
            game.network.send("shop", { Product: product.Name, Data: product.data });
            // function(data) {
            //     pay(product, data.Order);
            // }
            return false;
        });
        const help = dom.link("#", Shop.descriptions["how-to"], "product-help");
        help.onclick = function(event) {
            new Panel("shop-help", "Shop", dom.iframe(`shop/${game.lang}.html`)).show();
            event.preventDefault();
            return false;
        };
        const desc = Shop.descriptions[product.Tag];
        self.panel.setContents([
            dom.wrap("product-name", productName(product)),
            dom.hr(),
            dom.wrap("product-cost big", currency(product.Cost)),
            buyButton,
            (product.Tag == "hairstyle" && hairstylePreview(product)),
            dom.wrap("product-images", _.range(1, 4).map(function(index) {
                return dom.img(`assets/shop/${product.Name}/${index}.png`);
            })),
            dom.wrap("product-desc", desc),
            (product.Tag == "wall" && recipeLink(product)),
            help,
            (product.Name == "title" && titleEditor(product)),
            dom.button(T("Back"), "back", back),
        ]);
    }

    function productName(product) {
        return TS(hairstyleName(product.Name));
    }

    function hairstyleName(name) {
        return name.replace(/-(fe)?male/, "");
    }

    function pay(product, order) {
        var paymentType = param("paymentType", "AC");

        var card = dom.img("assets/shop/payment-card.png", "selected");
        card.title = T("Card");
        card.onclick = function() {
            yandex.classList.remove("selected");
            card.classList.add("selected");
            paymentType.value = "AC";
        };

        var yandex = dom.img("assets/shop/payment-yandex.png");
        yandex.title = T("Yandex");
        yandex.onclick = function() {
            card.classList.remove("selected");
            yandex.classList.add("selected");
            paymentType.value = "PC";
        };

        var name = productName(product);
        var form = dom.make("form", [
            param("receiver", "41001149015128"),
            param("formcomment", name),
            param("short-dest", name),
            param("quickpay-form", "shop"),
            param("targets", product.Name),
            param("sum", product.Cost),
            param("label", order),
            paymentType,
            T("Select payment method"),
            dom.wrap("methods", [card, " ", yandex]),
            dom.button(T("Pay"), "", function() {
                // firefox won't sumbit form if no button available
                // so we have to defer panel destruction
                _.defer(panel.close.bind(panel));
                return true;
            }),
        ]);
        form.action = "https://money.yandex.ru/quickpay/confirm.xml";
        form.method = "POST";
        form.target = "_blank";
        var panel = new Panel("payment", T("Payment"), form).show();
    }

    function param(name, value) {
        var input = dom.tag("input");
        input.name = name;
        input.value = value;
        input.type = "hidden";
        return input;
    }

    function back() {
        self.panel.setContents(self.tabs);
    }

    function search(pattern) {
        pattern = pattern.replace("-plan", "");
        var card = _.find(cards, function(card) {
            return card.name.match(pattern);
        });

        if (!card)
            return;

        card.tab.tab.title.click();
        card.onclick();
    }

    function hairstylePreview(product) {
        var color = dom.div("hairstyle-color");
        buyButton.disabled = true;
        return dom.wrap("hairstyle-preview", [
            dom.button(T("Try on"), "", function() {
                var name = hairstyleName(product.Name).replace("-hair", "");
                new Barbershop(name, function(hairstyle) {
                    buyButton.disabled = false;
                    product.data = hairstyle;
                    var style = hairstyle.split("#");
                    color.style.backgroundColor = "#" + style[1];
                    color.style.opacity = style[2];
                });
            }),
            color,
        ]);
    }

    function titleEditor(product) {
        var maxLength = 10;
        var prefix = dom.tag("input");
        prefix.setAttribute("maxlength", maxLength);
        var suffix = dom.tag("input");
        suffix.setAttribute("maxlength", maxLength);
        var result = dom.span(game.playerName);
        result.readonly = true;
        buyButton.disabled = true;
        return dom.wrap("title-preview", [
            prefix,
            game.playerName,
            suffix,
            dom.button(T("Ok"), "", function() {
                buyButton.disabled = false;
                result.textContent = (prefix.value + " " + game.playerName + " " + suffix.value).trim();
                product.data = (prefix.value + " {name} " + suffix.value).trim();
            }),
            dom.wrap("title-preview-result", [
                T("Title") + ": ",
                result,
            ])
        ]);
    }

    function recipeLink(product) {
        return dom.button(T("Recipe"), "product-recipe", function() {
            game.controller.craft.search(product.Name.replace(/-wall$/, ""), true);
        });
    }
}
