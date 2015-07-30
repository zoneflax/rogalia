"use strict";
function Donate() {
    var status = document.createElement("p");
    status.innerHTML = "Собрано 1 577,27";
    var iframe = document.createElement("iframe");
    iframe.frameBorder = 0;
    iframe.allowtransparency = true;
    iframe.scrolling = "no";
    iframe.src = "https://money.yandex.ru/embed/donate.xml?account=41001149015128&quickpay=donate&payment-type-choice=on&default-sum=&targets=%D0%9D%D0%B0+%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D1%83+%D1%81%D0%B5%D1%80%D0%B2%D0%B5%D1%80%D0%B0+%D0%B8+%D1%85%D1%83%D0%B4%D0%BE%D0%B6%D0%BD%D0%B8%D0%BA%D0%B0&target-visibility=on&project-name=&project-site=http%3A%2F%2Frogalik.tatrix.org%2F&button-text=05&successURL=";

    iframe.width = 507;
    iframe.height = 104;

    var panel = new Panel("donate", "Donate", [status, iframe]);
    panel.show();
}
