"use strict";

class GameStorage {
    constructor(prefix = "") {
        this.prefix = prefix;
    }

    setPrefix(prefix) {
        this.prefix = prefix;
    }

    getItem(key) {
        const value = localStorage.getItem(this.prefix + key);
        try {
            return JSON.parse(value);
        } catch(ex) {
            console.log("GameStorage:", ex);
            this.setItem(key, value);
            return value;
        }
    }

    setItem(key, value) {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    removeItem(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        localStorage.clear();
    }
}

const gameStorage = new GameStorage();
const playerStorage = new GameStorage();
