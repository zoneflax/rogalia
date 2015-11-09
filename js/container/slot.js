"use strict";
function ContainerSlot(container, index) {
    this.container = container;
    this.index = index;

    this.icon = null;
    this.entity = null;
    this.locked = false;
    this.spriteVersion = "";

    this.element = dom.slot();
    this.element.maxWidth = Container.SLOT_SIZE + "px";
    this.element.maxHeight = Container.SLOT_SIZE + "px";
    this.element.slot = this;

    this.sub = null;


    this.onclear = function() {};
}

ContainerSlot.prototype = {
    setTitle: function(title) {
        this.element.title = title;
    },
    markAsUnseen: function() {
        this.element.classList.add("new");
    },
    markAsSeen: function() {
        this.element.classList.remove("new");
    },
    lock: function() {
        this.locked = true;
        this.element.classList.add("locked");
    },
    unlock: function(entity) {
        this.locked = false;
        this.element.classList.remove("locked");
    },
    clear: function() {
        this.entity = null;
        this.sub = null;
        this.element.innerHTML = "";
        this.element.classList.remove("has-item");
        this.markAsSeen();
        this.unlock();
        this.onclear();
    },
    set: function(entity) {
        if (this.entity == entity && this.spriteVersion == entity.spriteVersion()) {
            this.update();
            return;
        }
        this.spriteVersion = entity.spriteVersion();
        this.clear();
        this.entity = entity;
        this.element.classList.add("has-item");

        var quality = document.createElement("sup");
        quality.className = "quality";
        quality.textContent = entity.Quality;
        if (entity.almostBroken())
            quality.classList.add("almost-broken");

        var icon = entity.icon();
        icon.classList.add("item");
        icon.slot = this;

        this.element.appendChild(icon);
        this.element.appendChild(quality);

        this.update();
    },
    setSub: function(text) {
        if (this.sub == null) {
            this.sub = document.createElement("sub");
            this.element.appendChild(this.sub);
        }
        this.sub.textContent = text;
    },
    update: function() {
        this.updateProgress();
        this.updateCustom();
        this.setTitle(this.entity.name);
    },
    updateProgress: function() {
        //TODO: make generic `progress' @server-side
        if (!("HideAdded" in this.entity))
            return;
        var added = new Date(this.entity.HideAdded);
        var duration = this.entity.HideDuration / 1e6;
        var diff = Date.now() - added;
        if (diff < duration) {
            this.setSub(util.toFixed(100*diff / duration) + "%");
        }
    },
    updateCustom: function() {
        if (this.entity.Group == "atom") {
            this.setSub(this.entity.Type);
        } else if ("Amount" in this.entity) {
            this.setSub(this.entity.Amount);
        }
    },
};
