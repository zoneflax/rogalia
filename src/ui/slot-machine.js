/* global Panel, dom, game, T, util */

"use strict";

class SlotMachine {
    constructor(entity) {
        this.entity = entity;
        this.pics = this.makePics();
        this.slots = this.makeSlots();
        this.button = this.makeButton();
        this.slotsContainer = dom.wrap("slots-container", this.slots);
        this.panel = new Panel("slot-machine", "Slots", [
            this.slotsContainer,
            this.button,
        ]).setEntity(entity).show();
    }

    gamble() {
        game.network.send("GambleTenSilver", {Id: this.entity.Id}, (data) => {
            console.log(data);
            this.run();
        });
    }

    run() {
        const N = this.pics.length - 1;
        let waiting = this.slots.length;
        this.slots.forEach(column => {
            column.addEventListener("transitionend", () =>  {
                waiting--;
                if (waiting == 0) {
                    this.button.disabled = false;
                    this.reset();
                }
            });
            const n = util.rand(N/2, N) * 100;;
            column.dataset.n = n;
            column.style.transform = `translateY(-${n}%)`;
        });
    }

    reset() {
        const head = this.slots.map(column => {
            const current = column.dataset.n / 100;
            return column.removeChild(column.children[current]);
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
        ];
    }

    makeButton() {
        const button = dom.button(T("Roll"), "", () => {
            button.disabled = true;
            this.gamble();
        });
        return button;
    }

    makePics() {
        return _.range(1, 18).map(i => game.loader.loadImage(`flower-${i}.png`));
    }

}
