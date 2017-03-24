/* global dom, T, game, TT, Panel, ContainerSlot, Container */

"use strict";

class TradeSlot extends ContainerSlot {
}

class Trade {
    init(partner, {MyContainer, PartnerContainer}) {
        this.partner = partner;

        this.myContainer = Container.open(Entity.get(MyContainer));
        this.partnerContainer = Container.open(Entity.get(PartnerContainer));
        this.partnerContainer.slots.forEach(slot => slot.readonly = true);

        this.panel = new Panel("trade", "Trade", [
            dom.wrap("trade-my", [
                game.playerName,
                this.myContainer.panel.contents,
            ]),
            dom.wrap("trade-buttons", [
                dom.button(T("Confirm"), "", () => this.confirm()),
                dom.button(T("Cancel"), "", () => this.panel.close()),
            ]),
            dom.wrap("trade-partner", [
                partner.Name,
                this.partnerContainer.panel.contents,
            ])
        ], {
            hide: () => this.cancel(),
        }).setTemporary(true).show();

        this.panel.entity = partner;
        this.panel.container = this.myContainer;
    }

    getContainer() {
        return this.panel.visible && this.myContainer;
    }

    update(data) {
        const {Name, Partner} = data;
        const partner = game.characters.get(Partner);
        if (!partner) {
            console.warn(`Partner ${Partner} not found`);
            return;
        }

        switch (Name) {
        case "offer":
            this.offer(partner);
            break;
        case "denied":
            this.denied(partner);
            break;
        case "init":
            this.init(partner, data);
            break;
        case "confirm":
            this.confirmed();
            break;
        case "unconfirm":
            this.unconfirmed();
            break;
        case "canceled":
            this.canceled();
            break;
        }

    }

    offer(partner) {
        game.popup.confirm(
            TT("{name} offers you trade", {name: partner.Name}),
            () => {
                game.network.send("trade", {Name: "accept", Partner: partner.Id});
            },
            () => {
                game.network.send("trade", {Name: "deny", Partner: partner.Id});
            }
        );
    }

    cancel() {
        game.network.send("trade", {Name: "cancel", Partner: this.partner.Id});
    }


    confirm() {
        this.panel.element.classList.add("our-confirmed");
        game.network.send("trade", {Name: "confirm", Partner: this.partner.Id});
    }

    denied(partner) {
        game.popup.alert(TT("{name} denied trade", {name: partner.Name}));
    }

    confirmed() {
        this.panel.element.classList.add("their-confirmed");
    }

    unconfirmed() {
        if (this.panel) {
            this.panel.element.classList.remove("our-confirmed");
            this.panel.element.classList.remove("their-confirmed");
        }
    }

    canceled() {
        this.panel.hooks.hide = null;
        this.panel.close();
    }
}
