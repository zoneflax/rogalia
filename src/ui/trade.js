/* global dom, T, game, TT, Panel, ContainerSlot, Container */

"use strict";

class TradeSlot extends ContainerSlot {
}

class Trade {
    constructor(trader) {
        this.trader = trader;

        this.ours = this.makeSlots(false);
        this.theirs = this.makeSlots(true);
        this.panel = new Panel("trade", "Trade", [
            dom.wrap("trade-ours", [
                game.playerName,
                this.ours,
            ]),
            dom.wrap("trade-buttons", [
                dom.button(T("Confirm")),
                dom.button(T("Cancel")),
            ]),
            dom.wrap("trade-theirs", [
                trader.Name,
                this.theirs,
            ])
        ], {
            hide: () => this.cancel(),
        }).setTemporary(true).show();

        Trade.instance = this;
    }

    add(item) {
        const data = JSON.parse(item);
        const entity = new Entity(data.Type);
        entity.sync(data);
        entity.initSprite();
        for (const child of this.theirs.children) {
            const slot = child.containerSlot;
            if (!slot.entity) {
                slot.set(entity);
                return;
            }
        }
        console.warn("Cannot add new item to trade");
        // TODO: <<<<<<<<<<<<<<<<<< REMOVE entity on cancel
    }

    cancel() {
        game.network.send("trade", {Name: "cancel"});
    }

    makeSlots(readonly) {
        return dom.wrap("slots-wrapper", _.times(16, (i) => {
            const slot = new ContainerSlot({panel: this.panel, entity: {}}, i);
            slot.element.trade = true;
            slot.element.onmousedown = () => {
                if (slot.entity) {
                    Container.getEntitySlot(slot.entity).unlock();
                    slot.clear();
                }
            };
            slot.element.use = (entity) => {
                if (readonly) {
                    return false;
                }
                const from = Container.getEntityContainer(entity);
                if (!from)
                    return false;

                from.findSlot(entity).lock();
                slot.set(entity);
                game.network.send("trade", {Name: "add", Trader: this.trader.Id, Id: entity.Id});
                return true;
            };
            return slot.element;
        }));
    }

    static update({Name, Trader, Item = null}) {
        switch (Name) {
        case "added":
            if (Trade.instance)
                Trade.instance.add(Item);
            else
                console.warn("Trying to add item to trade added, but no Trade.instance is null");
            return;
        }

        const trader = game.characters.get(Trader);
        if (!trader) {
            console.warn(`Trader ${Trader} not found`);
            return;
        }

        switch (Name) {
        case "offer":
            Trade.offer(trader);
            break;
        case "denied":
            Trade.denied(trader);
            break;
        case "accepted":
            Trade.start(trader);
        }

    }

    static offer(trader) {
        game.popup.confirm(
            TT("{name} offers you trade", {name: trader.Name}),
            function() {
                game.network.send("trade", {Name: "accept", Trader: trader.Id}, Trade.start);
            },
            function() {
                game.network.send("trade", {Name: "deny", Trader: trader.Id});
            }
        );
    }

    static denied(trader) {
        game.popup.alert(TT("{name} denied trade", {name: trader.Name}));
    }

    static start(trader) {
        new Trade(trader);
    }
}
