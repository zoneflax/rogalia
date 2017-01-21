/* global dom, TS, util */

"use strict";

class ParamBar {
    constructor(name) {
        this.name = name;
        this.current = dom.wrap("param-bar-value");
        this.overflow = dom.wrap("param-bar-overflow");
        this.status = dom.wrap("param-status");
        this.element = dom.wrap("param-bar " + name.toLowerCase(), [
            this.current,
            this.overflow,
            dom.wrap("param-name", TS(name)),
            this.status,
        ]);
    }

    update(param) {
        const value = Math.round(param.Current / param.Max * 100);
        this.current.style.width = Math.min(100, 100 - value) + "%";
        this.overflow.style.width = Math.max(0, value - 100) + "%";
        const status = util.toFixed(param.Current) + " / " + util.toFixed(param.Max);
        this.status.textContent = status;
        this.element.title = TS(this.name) + ": " + status;
    }
}
