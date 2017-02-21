/* global util, dom, game, Container */

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
    this.element.containerSlot = this;
    this.element.onmousedown = this.onmousedown.bind(this);

    this.sub = null;
    this.bar = null;
    this.placeholder = null;
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
        this.bar = null;
        dom.setContents(this.element, this.placeholder);
        this.element.classList.remove("has-item");
        this.element.classList.remove("non-effective");
        this.setTitle(this.placeholder && this.placeholder.title || "");
        this.markAsSeen();
        this.unlock();
    },
    set: function(entity) {
        if (this.entity == entity && this.spriteVersion == entity.spriteVersion()) {
            this.update();
            return;
        }
        switch (this.container.entity.Type) {
        case "chess-table":
            if (entity.Type.split("-")[0] == "white")
                this.container.panel.setTitle("Black move");
            else
                this.container.panel.setTitle("White move");
            break;
        }
        this.spriteVersion = entity.spriteVersion();
        this.clear();
        this.entity = entity;
        this.element.classList.add("has-item");

        var quality = dom.tag("sup", "quality", {text: entity.Quality});
        if (entity.almostBroken())
            quality.classList.add("almost-broken");

        var icon = entity.icon();
        icon.classList.add("item");
        icon.containerSlot = this;

        dom.append(this.element, [icon, quality]);

        this.update();
    },
    setPlaceholder(src, title = "") {
        if (this.placeholder == null) {
            this.placeholder = dom.img(src, "placeholder");
            this.placeholder.title = title;
            this.setTitle(title);
            dom.append(this.element, this.placeholder);
        }
        this.placeholder.src = src;
    },
    setSub: function(text) {
        if (this.sub == null) {
            this.sub = dom.tag("sub");
            dom.append(this.element, this.sub);
        }
        this.sub.textContent = text;
    },
    setBar: function(percent, cls) {
        if (this.bar == null) {
            this.bar = dom.wrap("bar", dom.div("bar-value"));
            dom.append(this.element, this.bar);
        }
        if (cls) {
            this.bar.classList.add(cls);
        }
        this.bar.firstChild.style.width = percent + "%";

        this.setSub(util.toFixed(percent) + " %");
        this.sub.classList.add("sub-bar");
    },
    update: function() {
        this.updateProgress();
        this.updateCustom();
        this.updateRequirements();
        this.setTitle(this.entity.name);
    },
    updateProgress: function() {
        if (!this.entity)
            return;
        if ("Readiness" in this.entity) {
            var rd = this.entity.Readiness;
            if (rd.Max != 0) {
                this.setBar(100*rd.Current / rd.Max, "progress");
            }
            return;
        }
        if ("Generate" in this.container.entity && "Progress" in this.container.entity.Generate) {
            this.setSub(this.container.entity.Generate.Progress + " %");
            return;
        }
        //TODO: make generic `progress' @server-side
        var cnt = this.container.entity;
        if (!("HideAdded" in cnt))
            return;
        var added = new Date(cnt.HideAdded);
        var duration = cnt.HideDuration / 1e6;
        var diff = Date.now() - added;
        if (diff < duration) {
            this.setBar(100*diff / duration, "progress");
        }
    },
    updateCustom: function() {
        if (this.entity.Group == "atom") {
            this.setSub(this.entity.Type);
        } else if ("Amount" in this.entity) {
            this.setSub(this.entity.Amount);
        } else if (this.entity.SpawnChance > 0) {
            this.setSub(this.entity.SpawnChance);
        } else if (this.entity.isTool()) {
            this.setBar(this.entity.durabilityPercent());
        }
    },
    updateRequirements: function() {
        if (this.entity.EffectiveParam) {
            if (this.entity.nonEffective())
                this.element.classList.add("non-effective");
            else
                this.element.classList.remove("non-effective");
        }
    },
    onmousedown: function(event) {
        if (this.locked)
            return;

        var entity = this.entity;
        //slot is empty
        if (!entity)
            return;

        this.markAsSeen();

        if (event.button == game.controller.RMB) {
            game.menu.show(entity);
            return;
        }
        // character.js inspect
        if (this.container.inspect) {
            return;
        }

        if (game.controller.hovered) // swap
            return;

        var mods = game.controller.modifier;

        if (mods.shift && !mods.ctrl) {
            game.chat.linkEntity(entity);
            return;
        }

        if (mods.alt) {
            const top = this.container.getTopExcept(entity.Container, true);
            if (top && top.entity.canUse(entity)) {
                top.entity.use(entity);
                return;
            }
        }
        if (mods.ctrl) {
            this.container.dwim(this);
            return;
        }

        event.stopPropagation();
        this.lock();
        game.controller.cursor.set(entity, event.pageX, event.pageY, () => this.unlock());
    },
    // TODO: this is ugly; fixme; used in "R - repeat"
    click: function() {
        this.element.dispatchEvent(new MouseEvent("mousedown", {
            clientX: game.controller.mouse.x,
            clientY: game.controller.mouse.y,
        }))
    },
};
