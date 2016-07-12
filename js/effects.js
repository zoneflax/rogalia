"use strict";

function EffectDesc(name) {
    var effect = EffectDesc.effects[name];
    if (!effect) {
        return dom.div("effect-description-missing", {text: T("No description yet")});
    }
    var contents = [
        dom.div("effect-" + effect.class, {text: T("Effect") + ": " + effect.effect})
    ];
    if (effect.desc) {
        contents.push(dom.hr());
        contents.push(dom.div("effect-desc", {text: effect.desc}));
    }
    if (effect.note) {
        contents.push(dom.hr());
        contents.push(dom.div("effect-note", {text: T("Note") + ": " + effect.note}));
    }

    var desc = dom.div("effect-desc-wrapper");
    dom.append(desc, contents);
    return desc;
}

EffectDesc.className = function(name) {
    var effect = EffectDesc.effects[name];
    if (!effect) {
        return "";
    }
    return "effect-" + effect.class;
};
