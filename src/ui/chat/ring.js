"use strict";
class ChatRing {
    constructor() {
        this.ring =  [];
        this.current =  this.ring.length;
        this.backup = "";
    }

    last() {
        if (this.ring.length == 0)
            return null;
        return this.ring[this.ring.length-1];
    }

    prev() {
        this.current = Math.max(0, this.current-1);
        if (this.ring.length == 0)
            return this.backup;

        return this.ring[this.current];
    }

    next() {
        this.current = Math.min(this.ring.length, this.current+1);
        if (this.current == this.ring.length)
            return this.backup;

        return this.ring[this.current];
    }

    save(message) {
        if (this.current >= this.ring.length)
            this.backup = message;
    }

    push(message) {
        if (this.last() == message)
            return;

        this.ring.push(message);
        this.current = this.ring.length;
    }

    loadFromStorage() {
        this.ring = playerStorage.getItem("chat.ring") || [];
        this.current = this.ring.length;
    }

    saveToStorage() {
        playerStorage.setItem("chat.ring", this.ring);
    }
}
