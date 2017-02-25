/* global dom, util */

"use strict";

class ProgressBar {
    constructor(container = null, prefix = "") {
        this._prefix = prefix;
        this._value = 0;
        this._max = 100;
        this._valueElem = dom.div("progress-value");
        this._valueText = dom.div("progress-text");
        this.element = dom.wrap("progress-bar", [
            this._valueElem,
            this._valueText,
        ]);

        if (container) {
            dom.appendOne(container, this.element);
        }
    }

    get value() {
        return this._value;

    }

    set value(value) {
        // value = Math.max(value, this._value);
        this._value = value;
        this._valueText.textContent = this._prefix + util.toFixed(value) + "%";
        this._valueElem.style.width = value + "%";
    }

    show() {
        dom.show(this.element);
    }

    hide() {
        dom.hide(this.element);
    }
}
