"use strict";

function Shop() {
    var self = this;
    var currency = "₽";
    this.tabs = null;

    this.panel = new Panel("shop", "Shop", [], null, {
        show: function() {
            this.hooks.show = null;
            load();
        },
    });

    var groups = [
    ];

    var descriptions = {
        "hairstyle": [
            'В примерочной подберите цвет и прозрачность, после нажмите "Приобрести".',
            'После оплаты вам придет посылка. Заберите её у любого почтового ящика. Распакуйте и примените вашу прическу.',
            'Чтобы шлем не скрывать прическу, отключите его отображение в Настройках.',
        ],
    };

    function load() {
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
                    var card = dom.wrap("product-card", [
                        dom.wrap("product-desc", [
                            TS(product.Name),
                            dom.wrap("product-cost", product.Cost + currency),
                        ]),
                    ]);
                    card.style.backgroundImage = "url(assets/shop/" + product.Name + "/preview.png)";
                    card.onclick = function() {
                        openCard(product);
                    };
                    contents.push(card);
                });
                tabs[index].contents = dom.wrap("products", contents);
            });
            self.tabs = dom.tabs(tabs);
            self.panel.setContents(self.tabs);
        });
    }

    function openCard(product) {
        var name = TS(product.Name);
        var desc = descriptions[product.Tag];
        self.panel.setContents([
            dom.wrap("product-name", name),
            dom.wrap("product-cost big", product.Cost + currency),
            dom.button(T("Buy"), "product-buy", function() {
                game.network.send("shop", { Product: product.Name }, function(data) {
                    pay(product, data.Order);
                });
                return false;
            }),
            dom.wrap("product-desc-container", desc.map(function(text, index) {
                return dom.wrap("product-desc", [
                    dom.img("assets/shop/" + product.Name + "/" + (index + 1) +".png"),
                    text,
                ]);
            })),
            dom.button(T("Back"), "back", back),
        ]);
    }

    function pay(product, order) {
        var name = TS(product.Name);
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

        var form = dom.make("form", [
            param("receiver", "41001149015128"),
            param("formcomment", name),
            param("short-dest", name),
            param("quickpay-form", "shop"),
            param("targets", product.Name),
            param("sum", 10 || product.Cost),
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
}
