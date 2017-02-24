/* global dom, ParamBar, game, T */

"use strict";

class Avatar {
    constructor(character) {
        this.character = character;

        this.avatar = character.avatar();
        this.avatar.classList.add("avatar-image");

        this.effects = dom.wrap("avatar-effects");
        const params = (character.isPlayer) ? ["Hp", "Fullness", "Stamina"] : ["Hp"];
        this.bars = params.map(param => new ParamBar(param, character[param]));
        const fullName = character.getFullName();
        const contents = dom.wrap("avatar-contents", [
            this.avatar,
            dom.wrap("avatar-info", [
                dom.wrap("avatar-name", fullName, {title: fullName}),
                dom.wrap("avatar-bars", this.bars.map(bar => bar.element)),
                this.makeChevron(),
            ]),
        ]);

        contents.onmousedown = (e) => this.onmousedown(e);

        this.element = dom.wrap("avatar-container", [contents, this.effects]);
        this.element.classList.add((character.isPlayer) ? "avatar-player" : "avatar-non-player");
    }

    setIcon(name) {
    }

    makeChevron() {
        return (this.character.Style && this.character.Style.Chevron)
            ? dom.img(`assets/icons/chevrons/${this.character.Style.Chevron}.png`, "avatar-chevron")
            : null;
    }

    update() {
        this.bars.forEach(bar => {
            const param = this.character[bar.name];
            if (param) {
                bar.update(param);
            }
        });
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
