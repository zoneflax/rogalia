/* global game, dom, Panel, sprintf, util, TS, T */

"use strict";

class Effects {
    constructor() {
        this.effects = {};
    }

    remove(name) {
        dom.remove(this.effects[name].element);
        delete this.effects[name];
    }

    update(pl = game.player) {
        this.updateClientSide(pl);

        for (var name in this.effects) {
            if (!pl.Effects[name]) {
                this.remove(name);
            }
        }

        for (name in pl.Effects) {
            this.upsert(name, pl.Effects[name]);
        }
    }

    updateClientSide(pl) {
        if (pl.synodProtection()) {
            pl.Effects["SynodProtection"] = {Duration: 0};
        } else {
            delete pl.Effects["SynodProtection"];
        }

        if (pl.Lvl <= 20) {
            pl.Effects["NewbieProtection"] = {Duration: 0};
        } else {
            delete pl.Effects["NewbieProtection"];
        }
    }

    upsert(name, data) {
        let effect = this.effects[name];
        if (!effect) {
            effect = new Effect(name, data);
            this.effects[name] = effect;
            game.controller.avatar.effects.appendChild(effect.element);
        }
        effect.update(data);
    }
}

class Effect {
    constructor(name, data) {
        const symbolName = util.stringToSymbol(name);
        this.name = name;
        this.hash = null;
        this.title = TS(symbolName);

        this.element = dom.div("effect " + this.className());
        this.element.title = this.title;
        this.element.onclick = () => this.showDescription();

        this.stacks = dom.span("", "effect-stacks", T("Stacks"));
        this.progress = null;

        dom.append(this.element, [
            dom.img("assets/icons/effects/" + symbolName + ".png", "effect-name"),
            this.stacks,
            this.makeProgressBar(data.Duration),
        ]);

        this.update(data);
    }

    makeProgressBar(duration) {
        if (duration == 0) {
            return null;
        }
        this.progress = dom.div("effect-progress");
        return dom.wrap("effect-progress-container", this.progress);
    }

    calcHash(data) {
        return data.Stacks + data.Duration;
    }

    update(data) {
        const hash = this.calcHash(data);
        if (this.hash == hash) {
            return;
        }

        this.stacks.textContent = (data.Stacks) > 1 ? data.Stacks : "";

        if (data.Duration == 0) {
            return;
        }

        const duration = new Date(data.Duration / 1e6);
        const last = new Date(duration - (Date.now() - data.Added*1000));
        this.element.title = sprintf(
            "%s %02d:%02d:%02d / %02d:%02d:%02d",
            this.title,
            last.getUTCHours(),
            last.getUTCMinutes(),
            last.getUTCSeconds(),
            duration.getUTCHours(),
            duration.getUTCMinutes(),
            duration.getUTCSeconds()
        );
        this.progress.style.height = (100 - 100 / (duration / last)) + "%";
    }

    className() {
        var effect = Effects.descriptions[this.name];
        if (!effect) {
            return "effect-neutral";
        }
        return "effect-" + (effect.class || "neutral");
    }


    showDescription() {
        new Panel("effect-description", this.title, this.makeDescription()).show();
    }

    makeDescription() {
        const effect = Effects.descriptions[this.name];
        if (!effect) {
            return dom.div("effect-description-missing", {text: T("No description yet")});
        }
        const contents = [
            dom.div("effect-effect effect-" + effect.class, {text: T("Effect") + ": " + effect.effect})
        ];
        if (effect.desc) {
            contents.push(dom.hr());
            contents.push(dom.div("effect-desc", {text: effect.desc}));
        }
        if (effect.note) {
            contents.push(dom.hr());
            contents.push(dom.div("effect-note", {text: T("Note") + ": " + effect.note}));
        }
        return contents;
    }
}
