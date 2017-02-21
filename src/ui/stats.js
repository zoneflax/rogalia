/* global game, dom, sprintf, Panel, T, config, Image, util, Statistics, Ratings, Customization, ContainerEquip, ParamBar, Character, TS */

"use strict";
class Stats {
    constructor() {
        // var contents = this.initSections();

        this.equipContainer = new ContainerEquip();
        const player = game.player;

        this.panel = new Panel(
            "stats",
            "Characteristics",
            [
                dom.wrap("stats-name", player.Name),
                dom.hr(),
                dom.wrap("equip-and-params", [
                    dom.wrap("equip-and-lvl", [
                        dom.wrap("lvl", T("Level") + ": " + player.Lvl),
                        this.makeEquip(player, this.equipContainer),
                    ]),
                    this.makeParams(player),
                ]),
                dom.hr(),
                this.makeParameters(player),
                dom.hr(),
                dom.wrap("", [
                    this.makeCustomization(),
                    dom.button(T("Statistics"), "",  () => { new Statistics(); }),
                    dom.button(T("Ratings"), "", () => { new Ratings(); }),
                ]),
            ]
        );
    }

    makeCustomization() {
        const customization = dom.make("button", [
            dom.img("assets/icons/customization.png"),
            T("Customization"),
        ]);
        customization.onclick = () => { new Customization(); };
        return customization;
    }

    makeEquip(player, equipContainer) {
        equipContainer.update();
        const slots = equipContainer.slots.reduce(function(slots, slot, i) {
            var name = Character.equipSlots[i];
            slot.setPlaceholder(`assets/icons/equip/${name}.png`, TS(name));
            slots[name] = slot.element;
            return slots;
        }, {});

        return dom.wrap("equip", [
            dom.div(),
            slots["head"],
            dom.div(),
            slots["bag"],
            slots["body"],
            slots["neck"],
            slots["left-hand"],
            slots["legs"],
            slots["right-hand"],
            dom.div(),
            slots["feet"],
            dom.div(),
        ].map(elem => {
            elem.classList.add("equip-cell");
            return elem;
        }));
    }

    makeParams(player) {
        return dom.wrap("stats-params", [
            param("Hp"),
            param("Fullness"),
            param("Stamina"),
            value("Karma"),
            dom.hr(),
            param("Exp"),
            value("LP"),
            ParamBar.makeValue("Status points", {
                Current: player.Citizenship.StatusPoints,
                Max: Math.pow(10, player.Citizenship.Rank),
            }),
            value("Fame"),
            value("Addiction"),
            dom.hr(),
            param("Speed"),
            value("Armor"),
            value("Defence"),
            value("Accuracy"),
        ]);

        function param(name) {
            return new ParamBar(name, player[name]).element;
        }

        function value(name, label = name) {
            return ParamBar.makeValue(label, player[name]);
        }
    }

    makeParameters(player) {
        return dom.wrap("parameters", [
            this.makeVitamins(player),
            this.makeAttrs(player),
        ]);
    }

    makeVitamins(player) {
        return dom.wrap("vitamins", Character.vitamins.map(function(vitamin) {
            return dom.wrap(`param vitamin-${vitamin.toLowerCase()}`, [
                T(vitamin),
                dom.wrap("value", [
                    util.toFixed(player.Health[vitamin], 2),
                    dom.wrap("arrow",  "→"),
                ]),
            ]);
        }));
    }

    makeAttrs(player) {
        return dom.wrap("attributes", Character.attrs.map(function(attr)  {
            return new ParamBar(
                attr.toLowerCase(),
                {
                    Current: player.Attr[attr].Current,
                    Max: 100,
                },
                2
            ).element;
        }));
    }

    sync() {
        if (!this.panel)
            return;
        if (!this.panel.visible) {
            this.panel.hooks.show = () => this.update();
            return;
        }
        // this.update();
    }

    update() {
        this.equipContainer.update();
        // this.updateSections();
    }

    // this in sections is bound to section's element
    sections() {
        return [
            {
                name: "summary",
                update: function(self, player) {
                    var name = dom.span(player.Name);
                    var lvl = dom.span(player.Lvl, "level", T("Level"));
                    var factionWrapper = dom.div("faction");
                    var faction = player.Citizenship.Faction;
                    if (faction) {
                        var citizenship = dom.span(T(faction));
                        citizenship.style.marginTop = "10px";
                        factionWrapper.appendChild(citizenship);

                        var rank = dom.span(" " + T("rank") + ": " + player.Citizenship.Rank);
                        factionWrapper.appendChild(rank);
                    }
                    return [lvl, name, factionWrapper];
                },
            },
        ];
    }
}
