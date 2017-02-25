/* global Panel, dom, game, T, util, TT, Vendor */

"use strict";

class SlotMachine {
    constructor(entity) {
        this.entity = entity;
        this.pics = this.makePics();
        this.slots = this.makeSlots();
        this.button = this.makeButton();
        this.slotsContainer = dom.wrap("slots-container", this.slots);
        this.panel = new Panel("slot-machine", "Slots", [
            this.makeBets([10, 25, 50]),
            dom.wrap("machine", [
                this.slotsContainer,
                this.button,
            ]),
            this.makeBets([1000, 2500, 5000]),
        ]).setEntity(entity).show();
        this.bet = this.panel.element.querySelector(".bet");
        this.bet.classList.add("checked");
        this.transitionend = () => {};
    }

    gamble() {
        game.network.send("gamble", {Id: this.entity.Id, Cost: +this.bet.dataset.cost}, (data) => {
            this.run(data.Win);
        });
    }


    ending() {
        const N = this.pics.length - 1;
        const set = new Set();
        return this.slots.map(column => {
            _.forEach(column.children, (slot) => slot.classList.remove("win"));

            for (let i = 0; i < N; i++) {
                var n = util.rand(N/2 << 0, N);
                var slot = column.children[n];
                if (!set.has(slot.firstChild.src)) {
                    break;
                }
            }

            set.add(slot.firstChild.src);
            column.dataset.index = n;
            column.style.transform = `translateY(-${n*100}%)`;
            return slot;
        });
    }

    run(win = 0) {
        let waiting = this.slots.length;
        let ending = this.ending();

        this.transitionend = () => {
            if (--waiting > 0) {
                return;
            }

            this.button.disabled = false;
            this.reset();
            if (win > 0) {
                game.controller.showMessage(TT("You win {cost}", {cost: Vendor.priceString(win)}));
                _.defer(() => ending.forEach(slot => slot.classList.add("win")));
            }
        };

        if (win > 0) {
            // prepare "win" slots
            const first = ending[0];
            for (let i = 1; i < this.slots.length; i++) {
                const slot = _.find(this.slots[i].children, (slot) => {
                    return slot.firstChild.src == first.firstChild.src;
                });
                dom.swap(slot.firstChild, ending[i].firstChild);
            }
        }
    }

    reset() {
        const head = this.slots.map(column => {
            return column.removeChild(column.children[column.dataset.index]);
        });
        this.slotsContainer.classList.add("shuffle");
        _.defer(() => this.slotsContainer.classList.remove("shuffle"));
        this.shuffle();
        this.slots.forEach((column, i) => {
            column.style.transform = "none";
            column.insertBefore(head[i], column.firstChild);
        });
    }

    shuffle() {
        this.slots.forEach(column => {
            for (let i = column.children.length; i >= 0; i--) {
                column.appendChild(column.children[Math.random() * i | 0]);
            }
        });
    }

    makeSlots() {
        return [
            dom.wrap("slots", _.shuffle(this.pics).map(pic => dom.wrap("slot", pic.cloneNode()))),
            dom.wrap("slots", _.shuffle(this.pics).map(pic => dom.wrap("slot", pic.cloneNode()))),
            dom.wrap("slots", _.shuffle(this.pics).map(pic => dom.wrap("slot", pic.cloneNode()))),
        ].map(column => {
            column.addEventListener("transitionend", (event) => {
                if (event.target == column) {
                    this.transitionend();
                }
            });
            return column;
        });
    }

    makeButton() {
        const button = dom.button(T("Roll"), "", () => {
            button.disabled = true;
            this.gamble();
        });
        return button;
    }

    makeBets(bets) {
        return dom.wrap("bets", bets.map(bet => {
            const button = dom.button(bet, "bet", () => {
                this.bet.classList.remove("checked");
                this.bet = button;
                this.bet.classList.add("checked");
            });
            button.dataset.cost = bet;
            return button;
        }));
    }

    makePics() {
        return [
            "R",
            "O",
            "G",
            "A",
            "L",
            "I",
            "K",
            "energy",
            "R",
            "O",
            "G",
            "A",
            "L",
            "I",
            "K",
            "energy",
        ].map(type => game.loader.loadImage(type + ".png"));
    }

}
