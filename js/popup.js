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
                dom.div("", {text: message}),
                dom.button(T("Ok"), "", panel.hide.bind(panel)),
            ]);
            panel.show();
            panel.center();
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
            panel.show();
            panel.center();
        },
    };
}
