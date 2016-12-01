/* global T, dom */

"use strict";

T.help = {
    fight: function(combos) {
        return dom.wrap("", [
            dom.make("h3", "Melee fighting"),
            dom.make("p", "Buffs can be activated by hitting an enemy (except for Nya)."),
            dom.make("p", "Irimi gives small speed up if character has any buff."),
            dom.table(["Name", "Combo", "Description"], combos),
            dom.hr(),
            dom.make("h3", "Ranged fighting"),
            dom.make("p", "To use ranged weapon your second hand must be empty."),
            dom.make("p", "Ammo is used to make a shot. It depends on weapon type."),
            dom.make("p", "You don't need ammo in the arena."),
            dom.wrap("", [
                "Every range weapon has:",
                dom.ul([
                    "Maximum range: targets outside it cannot be shot.",
                    "Effective range: inside this radius you got 100% accuracy.",
                    "Shooting speed: how fast you can launch a missile",
                    "Ammo type: for example stones, arrows, atoms",
                    "Ammo speed: how fast missile will reach the target.",
                ])
            ]),
            dom.make("p", "To see maximum and effective range press ctrl+shift."),
            dom.make("p", "The target can evade your if it leaves shot radius."),
            dom.make("p", "Outside of the effective zone you get increasing chance of missing."),
        ]);
    },
    combos: {
        de: "Buff (+absorb, +shield block chance)",
        su: "Buff (+damage, +crit chance)",
        nya: "AOE Buff (+crit chance for De, +absorb for Su)",
        ikkyo: "Strike (taunt, pvp: 50% stun for 1-5 secs)",
        shihonage: "Strike (a lot of damage, slow for 5 secs)",
        iriminage: "Strike (20% stun for 2 secs)",
    },
};
