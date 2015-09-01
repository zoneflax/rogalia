"use strict";
function Container(id) {
    this.id = +id;
    this.button = null;
    this.fuel = null;

    //set in reload
    this.container = null; //entity of container
    this.contents = [];
    this.slotsWidth = null;
    this.slotsHeight = null;
    this.name = null;
    this.valid = false; //need for update

    this.items = [];
    this.slots = [];

    this.panel = null;
    game.containers[this.id] = this;
    this.reload();
    this.createContainerPanel();
    this.update();
};

Container.SLOT_SIZE = 50;

Container.open = function(id) {
    var container = game.containers[id];
    if (!container)
        container = new Container(id);
    return container;
}

Container.moveItem = function(id, from, to, slot) {
    if (!to)
        return;
    id = parseInt(id);
    from.moveEnd(id);
    if (slot === undefined)
        slot = -1;
    var args = {
        Id: id,
        ToId: to.id,
        toSlot: slot,
    };
    var callback = function() {
        from.update();
        to && to.update();
    };
    game.network.send("entity-move", args, callback);
};

Container.updateVisibility = function() {
    for(var id in game.containers)
        game.containers[id].updateVisibility();
};

Container.save = function() {
    localStorage.setItem("containers", JSON.stringify(Object.keys(game.containers)));
};

Container.load = function() {
    var saved = JSON.parse(localStorage.getItem("containers"));
    saved && saved.filter(Entity.exists).forEach(Container.open);

    var bag = game.player.bag();
    if (bag) {
        var cnt = game.containers[bag.Id];
        if (cnt && cnt.panel.visible)
            cnt.panel.toTop();
    }
};

Container.prototype = {
    get visible() {
        return this.panel.visible;
    },
    set visible(v){
        this.panel.visible = v;
    },
    findItem: function(id) {
        var i = this.contents.indexOf(id);
        if (i < 0)
            return null;
        return this.items[i];
    },
    moveEnd: function(id) {
        var item = this.findItem(id);
        item && item.slot.classList.remove("selected");
    },
    dropItem: function(id) {
        var x = game.controller.world.x;
        var y = game.controller.world.y;
        var biom = game.map.biomAt(x, y);
        if (!biom) {
            game.sendErrorf("Biom (%d %d) not found", x, y);
            return;
        }

        var cmd = "entity-drop";
        var e = Entity.get(id);
        if (!e)
            return;

        var align = false;
        if ((biom.Name == "plowed-soil" || biom.Name == "soil") && e.is("seed")) {
            cmd = "plant";
            align = true;
        } else if ((biom.Name == "plowed-soil" || biom.Name == "shallow-water") && e.is("soil")) {
            cmd = "swamp";
            align = true;
        }

        if (align) {
            var p = new Point(x, y);
            var data = e.alignedData(p);
            if (data) {
                p.x = data.x + data.w/2;
                p.y = data.y + data.h/2;
            }

            x = p.x;
            y = p.y;
        }
        game.network.send(cmd, {
            Id: +id,
            X: x,
            Y: y,
        }, this.update.bind(this));
    },
    createContainerPanel: function() {
        var slots = document.createElement("div");
        slots.className = "slots-wrapper";
        for(var i = 0; i < this.size; i++) {
            var slot = document.createElement("div");
            slot.classList.add("slot");
            if(this.id == 0) {
                slot.title = TS(Character.equipSlots[i]);
                slot.classList.add("equip-" + Character.equipSlots[i]);
            }

            slot.index = i;
            slot.container = this;
            slot.item = null;

            this.slots[i] = slot;
            slots.appendChild(slot);
        }

        this.fuel = document.createElement("div");
        this.fuel.title = T("Fuel");
        this.fuel.className = "fuel-wrapper";
        this.updateFuel();

        var id = this.id;

        var moveAll = new Image();
        moveAll.className = "icon-button";
        moveAll.src = "assets/icons/panel/move-all.png";
        moveAll.title = T("Move all");

        moveAll.onclick = function() {
            var top = this.getTopExcept(id);
            if (top)
                game.network.send("move-all", {From: id, To: top.id});
        }.bind(this);

        var sort = new Image();
        sort.className = "icon-button";
        sort.src = "assets/icons/panel/sort.png";
        sort.title = T("Sort");
        sort.onclick = function() {
            game.network.send("Sort", {Id: id});
        };

        this.panel = new Panel(
            "container-" + this.id,
            this.name,
            [slots, this.fuel, util.hr(), moveAll, sort],
            {
                mousedown: this.clickListener.bind(this)
            }
        );
        this.panel.hooks.hide = function() {
            this.slots.map(function(slot) {
                slot.classList.remove("new");
            });
        }.bind(this);

        this.panel.hooks.show = this.update.bind(this);
        this.panel.element.classList.add("container");
        this.panel.container = this;

        var w = (this.id) ? this.slotsWidth : 1;
        this.panel.setWidth(w * Container.SLOT_SIZE + 2 * this.slotsWidth);
    },
    _getItemFromEvent: function(e) {
        var elem = e.target;
        if (elem.blocked)
            return null;

        if (elem.classList.contains("slot"))
            return elem.item || null;

        if (elem.classList.contains("item"))
            return elem;

        return null;
    },
    dwimCraft: function(item) {
        if (game.controller.craft.panel.visible) {
            var entity = Entity.get(item.id);
            if (!entity) {
                console.log("dwim:", item.id, " not found");
                return false;
            }
            var slots = game.controller.craft.slots;
            for(var i = 0, l = slots.length; i < l; i++) {
                if (!slots[i].used && entity.is(slots[i].group)) {
                    game.controller.craft.use(item, slots[i]);
                    return true;
                }
            }
        }
        return false;
    },
    dwim: function(item) {
        if (this.dwimCraft(item))
            return;

        var blank = game.controller.craft.blank;
        if (blank.panel && blank.panel.visible) {
            blank.use(item);
            return;
        }
        if (Panel.top.name == "blank-panel")
            return;

        var entity = Entity.get(item.id);
        var top = this.getTopExcept(entity.Container);
        if (top) {
            if (game.controller.modifier.ctrl && game.controller.modifier.shift) {
                game.network.send("move-all", {
                    From: entity.Container,
                    To: top.id,
                    Type: entity.Type,
                });
            } else {
                Container.moveItem(entity.Id, game.containers[entity.Container], top);
            }
            return;
        }

        entity.dwim();
    },
    clickListener: function(e) {
        game.controller.unhighlight("inventory");
        var item = this._getItemFromEvent(e);

        if (e.button == 2) {
            item && game.menu.show(Entity.get(item.id));
            return;
        }

        if (!item) //move to empty slot
            return;

        if (game.controller.iface.hovered) //swap
            return;

        item.slot.classList.remove("new");

        var mods = game.controller.modifier;

        if (mods.shift && !mods.ctrl) {
            game.chat.linkEntity(Entity.get(item.id));
            return;
        }

        if (mods.ctrl) {
            this.dwim(item);
            return;
        }





        e.stopPropagation();
        game.controller.iface.setCursor(item, e.pageX, e.pageY, this.moveEnd.bind(this, item.id));
    },
    reload: function() {
        if (this.id > 0) {
            this.container = Entity.get(this.id);
            if(!this.container) {
                game.error("Cannot find container with id %d", this.id);
            }
            // this.valid = this.validate(this.container.Props.Slots);
            this.contents = this.container.Props.Slots || [];
            this.slotsWidth = this.container.Props.SlotsWidth;
            this.slotsHeight = this.container.Props.SlotsHeight * (this.container.Props.SlotsWidth / this.slotsWidth);
            this.name = TS(this.container.Name);
        } else {
            //player's equip
            this.container = null;
            // this.valid = this.validate(game.player.Equip);
            // this.contents = game.player.Equip.slice(0); //we need a copy, so we can compare in validate
            this.contents = game.player.Equip;
            this.slotsWidth = 1;
            this.slotsHeight = this.contents.length;
            this.name = "Equip";
        }
        this.size = this.slotsWidth * this.slotsHeight;
    },
    validate: function(contents) {
        if (this.items.length == 0)
            return false;

        return this.contents.every(function(id, i) {
            return contents[i] == id;
        });
    },
    updateVisibility: function() {
        if (this.id && this.panel.visible && !game.player.canUse(this.container)) {
            this.panel.hide();
        }
    },
    // will be called on each Entity.sync
    update: function() {
        this.reload();

        for(var i = 0; i < this.size; i++) {
            var item = this.items[i] || null;
            var blocked = false;
            if (item) {
                blocked = item.blocked;
                item.slot.innerHTML = "";
                item.slot.classList.remove("has-item");
                if(this.id == 0) {
                    item.slot.title = TS(Character.equipSlots[i]);
                } else {
                    item.slot.title = "";
                }

                item.slot.item = null;
                item = null;
            }
            var itemId = this.contents[i];
            if(itemId != 0) {
                var e = Entity.get(itemId);
                if(!e) {
                    console.warn("Item with id %d is not found in container", itemId);
                    continue;
                }
                //TODO: fixme: show "?" instead of empty image
                item = e.icon();
                item.blocked = blocked;

                item.block = function(index) {
                    this.items[index].blocked = true;
                    this.slots[index].classList.add("blocked");
                }.bind(this, i);
                item.unblock = function(index) {
                    this.slots[index].classList.remove("blocked");
                    this.slots[index].classList.remove("selected");
                    if (!this.items[index])
                        return;
                    this.items[index].blocked = false;
                }.bind(this, i);

                item.classList.add("item");
                item.id = e.Id;
                item.title = e.name;
                item.container = this;
                item.index = i;
                item.style.maxWidth = Container.SLOT_SIZE + "px";
                item.style.maxHeight = Container.SLOT_SIZE + "px";
                item.entity = e;

                item.slot = this.slots[i];
                item.slot.title = item.title;
                var progress = false;

                var quality = document.createElement("sup");
                quality.className = "quality";
                quality.textContent = e.Quality;
                if (e.almostBroken())
                    quality.classList.add("almost-broken");


                this.slots[i].appendChild(item);
                this.slots[i].appendChild(quality);
                this.slots[i].item = item;
                this.slots[i].classList.add("has-item");

                var addSub = function(text) {
                    var sub = document.createElement("sub");
                    sub.textContent = text;
                    this.slots[i].appendChild(sub);
                }.bind(this);

                if (this.container && this.container.HideAdded) {
                    var added = new Date(this.container.HideAdded);
                    var duration = this.container.HideDuration / 1e6;
                    var diff = Date.now() - added;
                    if (diff < duration) {
                        addSub(util.toFixed(100*diff / duration) + "%");
                    }
                } else if (e.Group == "atom") {
                    addSub(e.Type);
                } else if ("Amount" in e) {
                    addSub(e.Amount);
                }
            }
            this.items[i] = item;
        }
        this.updateFuel();
    },
    updateFuel: function() {
        if (this.container && "Fuel" in this.container) {
            this.fuel.innerHTML = "";
            var value = this.container.Fuel;

            var current = document.createElement("div");
            current.className = "fuel-current";
            current.style.width = (value.Current/value.Max)*100 + "%";
            var max = document.createElement("div");
            max.className = "fuel-max";

            var slot = document.createElement("div");
            slot.className = "slot";
            slot.canUse = this.container.canUse.bind(this.container);
            slot.use = this.container.use.bind(this.container);

            this.fuel.appendChild(current);
            this.fuel.appendChild(max);
            this.fuel.appendChild(slot);
        }
    },
    hasSpace: function() {
        return this.contents.find(function(id) { return id == 0; }) !== undefined;
    },
    getTopExcept: function(except) {
        for (var i = Panel.stack.length-1; i >= 0; i--) {
            var panel = Panel.stack[i];
            if (panel.visible && panel.container && panel.container.id != except && panel.container.hasSpace())
                return panel.container;
        };
        return null;
    },
};
