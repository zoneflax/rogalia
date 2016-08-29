"use strict";

function Shop() {
    var self = this;
    var currency = "₽";
    this.tabs = null;

    var loaded = false;
    var onload = function(){};

    this.panel = new Panel("shop", "Shop", [], null, {
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
    });

    this.search = function(pattern) {
        onload = function() {
            search(pattern);
            onload = function(){};
        };
        this.panel.show();
    };

    var descriptions = {
        "hairstyle": [
            'В примерочной подберите цвет и прозрачность, после нажмите "Приобрести".',
            'После оплаты вам придет посылка. Заберите её у любого почтового ящика. Распакуйте и примените вашу прическу.',
            'Чтобы шлем не скрывать прическу, отключите его отображение в Настройках.',
        ],
        "misc": [
            'В примерочной подберите цвет и прозрачность, после нажмите "Приобрести".',
            'После оплаты вам придет посылка. Заберите её у любого почтового ящика. Распакуйте и примените вашу прическу.',
            'Чтобы шлем не скрывать прическу, отключите его отображение в Настройках.',
        ],
        "chopper": [
            'В примерочной подберите цвет и прозрачность, после нажмите "Приобрести".',
            'После оплаты вам придет посылка. Заберите её у любого почтового ящика. Распакуйте и примените вашу прическу.',
            'Чтобы шлем не скрывать прическу, отключите его отображение в Настройках.',
        ],
        "wall": [
            'В примерочной подберите цвет и прозрачность, после нажмите "Приобрести".',
            'После оплаты вам придет посылка. Заберите её у любого почтового ящика. Распакуйте и примените вашу прическу.',
            'Чтобы шлем не скрывать прическу, отключите его отображение в Настройках.',
        ],
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
                    title: T("Items"),
                }
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
                        dom.wrap("product-desc", [
                            productName(product),
                            dom.wrap("product-cost", product.Cost + currency),
                        ]),
                    ]);
                    card.name = product.Name;
                    card.tab = tabs[index];
                    card.style.backgroundImage = "url(assets/shop/" + product.Name + "/preview.png)";
                    card.onclick = function() {
                        openCard(product);
                    };
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
        self.panel.setContents([
            dom.wrap("product-name", productName(product)),
            dom.wrap("product-cost big", product.Cost + currency),
            dom.button(T("Buy"), "product-buy", function() {
                game.network.send("shop", { Product: product.Name, Data: product.data }, function(data) {
                    pay(product, data.Order);
                });
                return false;
            }),
            dom.wrap("product-desc-container", descriptions[product.Tag].map(function(text, index) {
                return dom.wrap("product-desc", [
                    dom.img("assets/shop/" + product.Name + "/" + (index + 1) +".png"),
                    text,
                ]);
            })),
            customInput(product),
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
                panel.close();
            }),
        ]);
        form.action = "https://money.yandex.ru/quickpay/confirm.xml";
        form.method = "POST";
        form.target = "_blank";
        var panel = new Panel("payment", T("Payment"), [form]).show();
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

    function customInput(product) {
        switch (product.Tag) {
        case "hairstyle":
            var color = dom.div("hairstyle-color");
            return dom.wrap("hairstyle-preview", [
                dom.button(T("Try on"), "", function() {
                    var name = hairstyleName(product.Name).replace("-hair", "");
                    new Barbershop(name, function(hairstyle) {
                        product.data = hairstyle;
                        var style = hairstyle.split("#");
                        color.style.backgroundColor = "#" + style[1];
                        color.style.opacity = style[2];
                    });
                }),
                color,
            ]);
            break;
        case "misc":
            switch (product.Name) {
            case "title":
                var prefix = dom.tag("input");
                var suffix = dom.tag("input");
                var result = dom.span(game.playerName);
                result.readonly = true;
                return dom.wrap("title-preview", [
                    prefix,
                    game.playerName,
                    suffix,
                    dom.button(T("Ok"), "", function() {
                        var title = (prefix.value + " " + game.playerName + " " + suffix.value).trim();
                        result.textContent = title;
                        product.data = title;
                    }),
                    dom.wrap("title-preview-result", [
                        T("Title") + ": ",
                        result,
                    ])
                ]);
            }
        }
        return null;
    };
}
