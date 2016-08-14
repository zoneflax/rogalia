"use strict";

function Popup(buttons) {
    var overlay = dom.div("popup-overlay");
    dom.insert(overlay);
    dom.hide(overlay);

    var panel = new Panel("popup");
    panel.temporary = true;
    dom.move(panel.element, overlay);


    panel.hooks.show = function() {
        window.addEventListener("keydown", onkeydown);
        dom.show(overlay);
    };
    var nop = function(){};
    var callback = nop;
    panel.hooks.hide = function() {
        window.removeEventListener("keydown", onkeydown);
        dom.hide(overlay);
        callback();
        callback = nop;
    };

    return {
        alert: function(message, onclose) {
            panel.setContents([
                dom.div("popup-message", {text: message}),
                dom.button(T("Ok"), "popup-ok", panel.hide.bind(panel)),
            ]);
            show();
            if (onclose)
                callback = onclose;
        },
        confirm: function(message, callback) {
            panel.setContents([
                dom.div("popup-message", {text: message}),
                dom.button(T("Ok"), "popup-ok", function() {
                    panel.hide();
                    callback();
                }),
                dom.button(T("Cancel"), "popup-cancel", panel.hide.bind(panel))
            ]);
            show();
        },
        prompt: function(message, value, callback) {
            var input = dom.tag(typeof value == "string" ? "textarea" : "input", "popup-input");
            input.value = value;
            panel.setContents([
                dom.div("popup-message", {text: message}),
                input,
                dom.button(T("Ok"), "popup-ok", function() {
                    panel.hide();
                    callback(input.value);
                }),
                dom.button(T("Cancel"), "popup-cancel", panel.hide.bind(panel))

            ]);
            show();
            input.focus();
        },
    };

    function onkeydown(event) {
        switch (event.key) {
        case "Enter":
        case " ":
            var button = overlay.getElementsByTagName("button")[0];
            button.click();
            break;
        }
    }

    function show() {
        panel.show();
        panel.center();
    }
}
