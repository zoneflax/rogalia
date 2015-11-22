"use strict";
function Stats() {
    this.equipContainer = new ContainerEquip();

    var contents = this.initSections();

    this.panel = new Panel(
        "stats",
        "Stats",
        contents,
        {
            mousedown: this.equipContainer.onmousedown.bind(this.equipContainer),
        }
    );
}

Stats.formatParam = function(param, digits) {
    var current = (param.Current == 0) ? "0" : util.toFixed(param.Current, digits);
    var max = util.toFixed(param.Max, 0);
    return current + ' / ' + max;
};

Stats.prototype = {
    createParam: function(label, param, digits, useColors, icon) {
        var max = param.Max || 0;
        var text = Stats.formatParam(param, digits);
        var meter = document.createElement("meter");
        if (useColors) {
            meter.low = 0.25*max;
            meter.high = 0.75*max;
            meter.optimum = max;
        }
        meter.max = (max == 0) ? 100 : max;
        meter.value = util.toFixed(param.Current, digits);
        meter.title = text;
        meter.textContent = text;

        var meterWrapper = document.createElement("div");
        meterWrapper.className = "meter-wrapper value";
        meterWrapper.appendChild(meter);

        if (icon) {
            var img = new Image();
            img.src = "assets/icons/" + icon.toLowerCase() + ".png";
            meterWrapper.appendChild(img);
        }

        if (config.ui.showMeterValues)  {
            var titleElem = document.createElement("div");
            titleElem.className = "meter-title";
            titleElem.textContent = text;
            meterWrapper.appendChild(titleElem);
        }

        var labelElem = document.createElement("label");
        labelElem.classList.add("param");
        labelElem.textContent = T(label);
        labelElem.appendChild(meterWrapper);
        return labelElem;

    },
    createValue: function(label, value, digits, icon) {
        var valueElem = document.createElement("span");
        valueElem.classList.add("value");
        digits = digits || 0;
        if (value instanceof Object) {
            value = value.Current;
        }
        valueElem.textContent = util.toFixed(value, digits);

        var labelElem = document.createElement("label");
        labelElem.classList.add("param");
        labelElem.textContent = T(label);
        labelElem.appendChild(valueElem);

        if (icon) {
            var img = new Image();
            img.src = "assets/icons/" + icon.toLowerCase() + ".png";
            labelElem.appendChild(img);
        }

        return labelElem;
    },
    sync: function() {
        if (this.panel && !this.panel.visible)
            return;
        this.update();
    },
    update: function() {
        this.updateExp();
        this.updateSections();
    },
    // this in sections is bound to section's element
    sections: [
        {
            name: "summary",
            update: function(self, player) {
                var name = dom.span(player.Name);
                var lvl = dom.span(" " + T("level") + " " + player.Lvl);
                var factionWrapper = dom.div("faction");
                var faction = player.Citizenship.Faction;
                if (faction) {
                    var citizenship = dom.span(T(faction));
                    citizenship.style.marginTop = "10px";
                    factionWrapper.appendChild(citizenship);

                    var rank = dom.span(" " + T("rank") + ": " + player.Citizenship.Rank);
                    factionWrapper.appendChild(rank);
                }
                return [name, lvl, factionWrapper];
            },
        },
        {
            name: "doll",
            update: function(self, player) {
                var sex = player.sex();
                this.classList.add(sex);
                var worn =  ["feet", "legs", "body", "head"].filter(function(name) {
                    return !!player.equipSlot(name);
                });
                worn.push("naked");
                var dollStyle = worn.map(function(name) {
                    return "url('assets/bg/doll/" + sex + "/" + name + ".png')";
                }).join(",");
                this.style.backgroundImage = dollStyle;
            },
        },
        {
            name: "equip",
            update: function(self, player) {
                self.equipContainer.update();
                return self.equipContainer.slots.map(function(slot, i) {
                    var title = Character.equipSlots[i];
                    slot.onclear = function() {
                        slot.setTitle(TS(title));
                    };
                    slot.element.classList.add("equip-" + title);
                    return slot.element;
                });
            },
        },
        "---",
        {
            name: "vital",
            update: function(self, player) {
                return ["Hp", "Fullness", "Stamina"].map(function(param) {
                    return self.createParam(
                        param,
                        player[param],
                        0,
                        true,
                        "stats/" + param
                    );
                });
            },
        },
        "---",
        {
            name: "main",
            update: function(self, player) {
                var attributes = dom.div("attributes");
                Character.attrs.forEach(function(attr) {
                    var elem = self.createValue(attr, player.Attr[attr], 2);
                    elem.classList.add(attr.toLowerCase());
                    attributes.appendChild(elem);
                });

                var health = dom.div("health");
                Character.vitamins.forEach(function(vitamin) {
                    var elem = self.createValue(vitamin, player.Health[vitamin], 2);
                    elem.classList.add(vitamin.toLowerCase());
                    health.appendChild(elem);
                });
                return [
                    attributes,
                    dom.vr(),
                    health,
                ];
            },
        },
        "---",
        {
            name: "params",
            update: function(self, player) {
                return ["Speed", "Armor", "Defence", "Accuracy"].map(function(name) {
                    var param = player[name];
                    //TODO: actually now some of these is not params but simple ints
                    if (!(param instanceof Object))
                        param = {Max: param, Current: param};

                    return self.createParam(
                        name,
                        param,
                        0,
                        true,
                        "stats/" + name
                    );
                });
            },
        },
        "---",
        {
            name: "exp",
            update: function(self, player) {
                return [
                    self.createParam("Exp", player.Exp, 0, false, "stats/xp"),
                    self.createValue("Learning points", player.LP),
                ];
            },
        },
        "---",
        {
            name: "karmic",
            hidden: true,
            update: function(self, player) {
                return [
                    self.createValue("Karma", player.Karma),
                    self.createValue("Fame", player.Fame),
                    dom.hr(),
                ];
            },
        },
        {
            name: "statistics",
            hidden: true,
            update: function(self, player) {
                var sp = {
                    Current: player.Citizenship.StatusPoints,
                    Max: Math.pow(10, player.Citizenship.Rank),
                };
                return [
                    self.createValue("Kills", player.Statistics.Kills),
                    self.createValue("Players killed", player.Statistics.PlayersKilled),
                    self.createValue("Death", player.Statistics.Death),
                    self.createParam("Status points", sp),
                    dom.hr(),
                ];
            },
        }
    ],
    initSections: function() {
        var sections = [];
        var hidden = [];
        var contents = this.sections.map(function(section) {
            if (section == "---") {
                return dom.hr();
            }
            var elem = dom.div(section.name);
            if (section.hidden) {
                dom.hide(elem);
                hidden.push(elem);
            }
            section.elem = elem;
            sections.push(section);
            section.hash = null;
            return elem;
        });
        this.sections = sections;
        this.update();


        var toggleStats = dom.button(T("Stats"));
        toggleStats.onclick = function() {
            hidden.forEach(dom.toggle.bind(dom));
        };
        contents.push(toggleStats);

        return contents;
    },
    updateSections: function() {
        this.sections.forEach(this.updateSection.bind(this));
    },
    updateSection: function(section) {
        var contents = section.update.call(section.elem, this, game.player);
        if (!contents)
            return;
        var hash = contents.map(function(elem) { return elem.innerHTML; }).join("");
        if (section.hash === hash)
            return;
        section.hash = hash;
        var fragment = document.createDocumentFragment();
        contents.forEach(fragment.appendChild.bind(fragment));
        section.elem.innerHTML = "";
        section.elem.appendChild(fragment);
    },
    updateExp: function() {
        var xp = document.getElementById("xp-progress");
        var exp = game.player.Exp;
        var width = exp.Current/exp.Max * 100;
        if (+xp.style.width != width)
            xp.style.width = width + "%";
    },
};
