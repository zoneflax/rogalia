"use strict";

function Shop() {
    var self = this;
    var currency = "₽";
    this.tabs = null;

    var buyButton = null;

    var loaded = false;
    var onload = function(){};

    this.panel = new Panel("shop", "Shop [NOT READY YET]", [], {
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
            'Нажмите "Примерить" и выберите желаемый цвет, нажмите "Ок".',
            'Нажмите кнопку "Купить", выберите способ оплаты, нажмите "Оплатить".',
            'Получите посылку с товаром у почтового ящика в городе. Далее ПКМ - "Распаковать". Шлем можно отключить в Настройках.',
        ],
        "misc": [
            'Введите желаемый префикс и суфикс к своему имени, нажмите "Ок".',
            'Нажмите кнопку "Купить", выберите способ оплаты, нажмите "Оплатить".',
            'Получите посылку с товаром у почтового ящика в городе. Далее ПКМ - "Распаковать".',
        ],
        "chopper": [
            'Нажмите кнопку "Купить", выберите способ оплаты, нажмите "Оплатить".',
            'Получите посылку с товаром у почтового ящика в городе. Далее ПКМ - "Распаковать".',
            'От нанесения урона байк ломается. Топливо не требуется.',
        ],
        "wall": [
            'Нажмите кнопку "Купить", выберите способ оплаты, нажмите "Оплатить".',
            'Получите посылку с товаром у почтового ящика в городе. Далее ПКМ - "Распаковать".',
            'В посылке находится мешочек с 64 чертежами выбранной стены, которые нужно применить в крафте стен.',
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
                        dom.wrap("product-desc", [
                            productName(product),
                            dom.wrap("product-cost", product.Cost + currency),
                        ]),
                    ]);
                    card.name = product.Name;
                    card.tab = tabs[index];
                    card.style.backgroundImage = "url(assets/shop/" + product.Name + "/preview.png)";
                    card.onclick = function() {
                        // TODO: disabled
                        return;
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
        buyButton = dom.button(T("Buy"), "product-buy", function() {
            if (game.args["steam"]) {
                game.popup.alert(T("Comming soon"));
                return false;
            }
            game.network.send("shop", { Product: product.Name, Data: product.data }, function(data) {
                pay(product, data.Order);
            });
            return false;
        });
        self.panel.setContents([
            dom.wrap("product-name", productName(product)),
            dom.wrap("product-cost big", product.Cost + currency),
            buyButton,
            (product.Tag == "hairstyle" && hairstylePreview(product)),
            dom.wrap("product-desc-container", descriptions[product.Tag].map(function(text, index) {
                return dom.wrap("product-desc", [
                    dom.img("assets/shop/" + product.Name + "/" + (index + 1) +".png"),
                    text,
                ]);
            })),
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
}
