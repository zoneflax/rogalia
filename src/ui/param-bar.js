/* global dom, TS, util, T, game */

"use strict";

class ParamBar {
    constructor(name, param = null, digits = 0) {
        this.name = name;
        this.param = {Current: "?", Max: "?"};
        this.digits = digits;
        this.current = dom.wrap("param-bar-value");
        this.overflow = dom.wrap("param-bar-overflow");
        this.status = dom.wrap("param-status");
        this.element = dom.wrap("param-bar " + name.toLowerCase(), [
            this.current,
            this.overflow,
            dom.wrap("param-name", TS(name)),
            this.status,
        ], {
            onclick: () => {
                if (this.param && game.controller.modifier.shift) {
                    game.chat.linkValue(this.param, name);
                }
            }
        });

        if (param) {
            this.update(param);
        }
    }

    update(param) {
        if (this.param && param.Current == this.param.Current && param.Max == this.param.Max) {
            return;
        }
        this.param = param;
        const value = Math.round(param.Current / param.Max * 100);
        this.current.style.width = Math.min(100, 100 - value) + "%";
        this.overflow.style.width = Math.max(0, value - 100) + "%";
        const digits = (param.Current == param.Max) ? 0 : this.digits;
        const status = util.toFixed(param.Current, digits) + "/" + util.toFixed(param.Max);
        this.status.textContent = status;
        this.element.title = TS(this.name) + ": " + status;
    }

    static formatParam(param, digits) {
        var current = (param.Current == 0) ? "0" : util.toFixed(param.Current, digits);
        var max = util.toFixed(param.Max, 0);
        return current + ' / ' + max;
    }

    // TODO: deprecated
    static makeParam(label, param, digits, useColors, icon) {
        const max = param.Max || 0;
        const text = ParamBar.formatParam(param, digits);
        const meter = dom.tag("meter");
        // TODO: remove useColors
        if (useColors) {
            meter.low = 0.25*max;
            meter.high = 0.75*max;
            meter.optimum = max;
        }
        meter.max = (max == 0) ? 100 : max;
        meter.value = util.toFixed(param.Current, digits);
        meter.title = text;

        const meterWrapper = dom.wrap("meter-wrapper value", [
            meter,
            icon && dom.img(`assets/icons/${icon.toLowerCase()}.png`),
            dom.wrap("meter-title", text),
        ]);

        return dom.wrap("param", [
            dom.wrap("param-label", T(label)),
            meterWrapper
        ], {
            onclick: function() {
                if (game.controller.modifier.shift) {
                    game.chat.linkValue(param, label);
                }
            }
        });
    }

    static makeValue(label, paramOrvalue, digits = 0, icon) {
        const value = (paramOrvalue instanceof Object) ? paramOrvalue.Current : paramOrvalue;
        return dom.wrap("param", [
            T(label),
            dom.wrap("value", util.toFixed(value, digits)),
            icon && dom.img(`assets/icons/${icon.toLowerCase()}.png`),
        ], {
            onclick: function() {
                if (game.controller.modifier.shift) {
                    game.chat.linkValue({Current: value}, label);
                }
            }
        });
    }
}
