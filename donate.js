function Donate() {
    var init = function()  {
        var status = document.createElement("p");
        status.innerHTML = "Пока ориентируемся на облако за 2к/месяц<hr>Собрано 857.27 / 6000";
        var iframe = document.createElement("iframe");
        iframe.frameBorder = 0;
        iframe.allowtransparency = true;
        iframe.scrolling = "no";
        iframe.src = "https://money.yandex.ru/embed/donate.xml?account=41001149015128&quickpay=donate&payment-type-choice=on&default-sum=&targets=%D0%9D%D0%B0+%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D1%83+%D1%81%D0%B5%D1%80%D0%B2%D0%B5%D1%80%D0%B0&target-visibility=on&project-name=&project-site=http%3A%2F%2Frogalik.tatrix.org%2F&button-text=05&successURL=";
        iframe.width = 507;
        iframe.height = 104;
        this.contents.appendChild(status);
        this.contents.appendChild(iframe);
        this.hooks.show = null;
    }

    this.panel = new Panel("donate", "Donate", null, null, {show: init});
    this.toggle = function() {
        util.dom.toggle(this.panel.button);
    }
    this.afterButtonBind = function() {
        if (!config.ui.showDonate) {
            this.panel.hide();
            util.dom.hide(this.panel.button);
        }
    }
}
