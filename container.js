function Container(id) {
    this.id = id;
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

Container.SLOT_SIZE = 64;

Container.open = function(id) {
    var container = game.containers[id];
    if (!container)
        container = new Container(id);
    return container;
}

Container.moveItem = function(id, from, to, slot) {
    id = parseInt(id);
    from.moveEnd(id);
    if (slot === undefined)
        slot = -1
    var args = {
        Id: id,
        ToId: to.id,
        toSlot: slot,
    };
    var callback = function() {
        from.update();
        to && to.update();
    }
    game.network.send("entity-move", args, callback);
}

Container.updateVisibility = function() {
    for(var id in game.containers)
        game.containers[id].updateVisibility();
}

Container.getTopExcept = function(except) {
    var bag = game.player.bag();
    if (bag && bag.Id != except) {
        var container = game.containers[bag.Id];
        if (container.panel.visible)
            return container;
    }
    for (var id in game.containers) {
        if (id == except)
            continue;

        var container = game.containers[id];
        if (container.panel.visible)
            return container;
    }
    return null;
}


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

        var cmd = "entity-drop";
        var e = Entity.get(id);
        if (!e)
            return;

        var align = false
        if ((biom.Name == "plowed-soil" || biom.Name == "soil") && e.is("seed")) {
            cmd = "plant";
            align = true;
        } else if ((biom.Name == "plowed-soil" || biom.Name == "shallow-water") && e.is("soil")) {
            cmd = "swamp";
            align = true
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
        this.fuel.title = T("Fuel")
        this.fuel.className = "fuel-wrapper";
        this.updateFuel();

        var id = this.id;

        var moveAll = document.createElement("button");
        moveAll.textContent = T("Move all");
        moveAll.onclick = function() {
            var top = Container.getTopExcept(id);
            if (top)
                game.network.send("move-all", {From: id, To: top.id});
        }

        var sort = document.createElement("button");
        sort.textContent = T("Sort");
        sort.onclick = function() {
            game.network.send("Sort", {Id: id});
        };

        this.panel = new Panel(
            "container-" + this.id,
            this.name,
            [slots, this.fuel, moveAll, sort],
            {
                mousedown: this.clickListener.bind(this)
            }
        )
        this.panel.hooks.hide = function() {
            this.slots.map(function(slot) {
                slot.classList.remove("new");
            });
        }.bind(this);

        this.panel.hooks.show = this.update.bind(this);

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
            var slots = game.controller.craft.slots;
            for(var i = 0, l = slots.length; i < l; i++) {
                if (!slots[i].used && entity.is(slots[i].group)) {
                    game.controller.craft.use(item, slots[i]);
                    return;
                }
            }
        }
    },
    dwim: function(item) {
        this.dwimCraft(item);
        if (Panel.top.name == "craft")
            return;

        var blank = game.controller.craft.blank;
        if (blank.panel && blank.panel.visible) {
            blank.use(item)
            return;
        }
        if (Panel.top.name == "blank-panel")
            return;

        var entity = Entity.get(item.id);
        var top = Container.getTopExcept(entity.Container);
        if (top) {
            Container.moveItem(entity.Id, game.containers[entity.Container], top);
            return
        }

        entity.drop();
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
        if (game.controller.modifier.shift) {
            game.chat.linkEntity(Entity.get(item.id));
            return false;
        }

        if (e.ctrlKey) {
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
        })
    },
    updateVisibility: function() {
        if (this.id && this.panel.visible && !game.player.isNear(this.container)) {
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
                }.bind(this, i)

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
                var sup = document.createElement("sup");
                if (this.container && this.container.HideAdded) {
                    var added = new Date(this.container.HideAdded)
                    var duration = this.container.HideDuration / 1e6;
                    var diff = Date.now() - added;
                    if (diff < duration) {
                        sup.textContent = util.toFixed(100*diff / duration) + "%";
                        progress = true
                    }
                }
                var sub = null
                if (!progress) {
                    if (e.Group == "atom") {
                        sub = document.createElement("sub");
                        sub.textContent = e.Type;
                    }
                    sup.textContent = e.Amount || e.Quality;

                    if (e.almostBroken()) {
                        sup.style.color = "#f33";
                        sup.style.cursor = "help";
                        sup.title = T("Almost broken");
                    }
                }

                this.slots[i].appendChild(item);
                if (sub)
                    this.slots[i].appendChild(sub);
                this.slots[i].appendChild(sup);
                this.slots[i].item = item;
                this.slots[i].classList.add("has-item");

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
};
