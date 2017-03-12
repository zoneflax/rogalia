/* global Panel, dom, T */

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
            var button = dom.button(T("Ok"), "popup-ok", panel.hide.bind(panel));
            panel.setContents([
                dom.wrap("popup-message", message),
                button,
            ]);
            show();
            button.focus();
            if (onclose)
                callback = onclose;
        },
        confirm: function(message, callback, cancel = () => {}) {
            panel.setContents([
                dom.wrap("popup-message", message),
                dom.button(T("Ok"), "popup-ok", function() {
                    panel.hide();
                    callback();
                }),
                dom.button(T("Cancel"), "popup-cancel", () => {
                    panel.hide();
                    cancel();
                }),
            ]);
            show();
        },
        prompt: function(message, value, callback) {
            var input;
            if (_.isArray(value)) {
                input = dom.tag("textarea", "popup-input");
                input.value = value.join("\n");
            } else {
                input = dom.tag("input", "popup-input");
                input.value = value;
            }
            panel.setContents([
                dom.wrap("popup-message", message),
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
        switch (event.target.tagName) {
        case "TEXTAREA":
            break;
        case "INPUT":
            accept(event, ["Enter"]);
            break;
        default:
            accept(event, ["Enter", " "]);
        }
    }

    function accept(event, types) {
        if (!types.includes(event.key))
            return;
        event.preventDefault();
        var button = overlay.getElementsByTagName("button")[0];
        button.click();
    }

    function show() {
        panel.show().center();
    }
}
