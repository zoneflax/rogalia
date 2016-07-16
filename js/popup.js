"use strict";

function Popup(buttons) {
    var overlay = dom.div("popup-overlay");
    dom.insert(overlay);
    dom.hide(overlay);

    var panel = new Panel("popup");
    panel.temporary = true;
    dom.move(panel.element, overlay);

    panel.hooks.show = function() {
        dom.show(overlay);
    };
    var nop = function(){};
    var callback = nop;
    panel.hooks.hide = function() {
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

    function show() {
        panel.show();
        panel.center();
    }
}
