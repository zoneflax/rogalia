/* global dom, ParamBar, game, T */

"use strict";

class Avatar {
    constructor(character) {
        this.character = character;
        this._state = {
            lvl: 0,
            chevron: null,
        };

        this.avatar = character.avatar();
        this.avatar.classList.add("avatar-image");

        this.effects = dom.wrap("avatar-effects");
        const params = (character.isPlayer) ? ["Hp", "Fullness", "Stamina"] : ["Hp"];
        this.bars = params.map(param => new ParamBar(param, character[param]));
        this.name = this.makeName();
        const contents = dom.wrap("avatar-contents", [
            this.avatar,
            dom.wrap("avatar-info", [
                this.name,
                dom.wrap("avatar-bars", this.bars.map(bar => bar.element)),
            ]),
        ]);

        contents.onmousedown = (e) => this.onmousedown(e);

        this.element = dom.wrap("avatar-container", [contents, this.effects]);
        this.element.classList.add((character.isPlayer) ? "avatar-player" : "avatar-non-player");
    }

    setIcon(name) {
    }

    makeName(character = this.character) {
        const fullName = character.getFullName();
        this._state.lvl = character.Lvl;
        return dom.wrap("avatar-name", [
            fullName,
            dom.wrap("avatar-icons", [
                this.makeChevron(),
                character.Domestical && dom.wrap(
                    "avatar-sex avatar-icon",
                    ["♂", "♀"][character.Sex],
                    {title: T(character.sex())}
                ),
                character.Lvl && dom.wrap(
                    "avatar-lvl avatar-icon",
                    character.Lvl,
                    {title: T("Level")}
                ),
            ]),
        ], {title: fullName});
    }

    makeChevron(character = this.character) {
        const chevron = character.chevron();
        this._state.chevron = chevron;

        return (chevron)
            ? dom.img(`assets/icons/chevrons/${chevron}.png`, "avatar-chevron")
            : null;
    }

    update(character = this.character) {
        this.bars.forEach(bar => {
            const param = character[bar.name];
            if (param) {
                bar.update(param);
            }
        });
        // react, where are you?
        if (this._state.lvl != character.Lvl || this._state.chevron != character.chevron()) {
            this.name = dom.replace(this.name, this.makeName());
        }
    }

    onmousedown(e) {
        e.stopPropagation();
        if (this.character.IsNpc) {
            return game.menu.show(this.character);
        }

        if (!this.character.isPlayer) {
            return game.chat.nameMenu(e, this.character.Name);
        }

        switch (e.button) {
        case game.controller.LMB:
            game.controller.stats.panel.toggle();
            break;
        case game.controller.RMB:
            var actions = {};
            if (game.player.Party) {
                actions.leaveParty = function() {
                    game.chat.send("*part");
                };
            }
            actions.suicide = function() {
                game.popup.confirm(T("Commit suicide?"), () => game.chat.send("*suicide"));
            };
            actions.unstuck = function() {
                game.chat.send("*unstuck");
            };
            actions.returnHome = function() {
                game.network.send("return-home");
            };
            game.menu.show(actions);
            break;
        }
        return true;
    }
}
