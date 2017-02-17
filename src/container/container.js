/* global Panel, dom, game, T, ContainerSlot */

"use strict";
function Container(entity) {
    this.entity = entity;
    this.id = +entity.Id;

    this.button = null;
    this.fuel = null;
    this.name = "";

    // copy if entity.Props data or players.Equp
    this._slots = [];
    this._slotsWidth = null;
    this._slotsHeight = null;

    this.slots = [];

    this.panel = null;
    this.init();
    this.createContainerPanel();
    this.update();

    this._syncReq = false;
};

Container.SLOT_SIZE = 52; // .slot:width + 2*slot:margin

Container.show = function(entity) {
    Container.open(entity).panel.show();
};

Container.open = function(entity) {
    var container = Container.get(entity);
    if (!container) {
        container = new Container(entity);
        game.containers[container.id] = container;
    }
    return container;
};

Container.get = function(entity) {
    return game.containers[entity.Id];
};

Container.getEntityContainer = function(entity) {
    if (entity.Location == Entity.LOCATION_IN_CONTAINER)
        return Container.get(entity.findContainer());
    else if (entity.Location == Entity.LOCATION_EQUIPPED)
        return game.controller.stats.equipContainer;
    else
        return null;
};

Container.getEntitySlot = function(entity) {
    const cnt = Container.getEntityContainer(entity);
    return cnt && cnt.findSlot(entity);
};

Container.move = function(entity, toContainer, slotIndex) {
    game.network.send("entity-move", {
        Id: +entity.Id,
        ToId: +toContainer.id,
        toSlot: (slotIndex === undefined) ? -1 : slotIndex,
    });
};

Container.save = function() {
    playerStorage.setItem("containers", Object.keys(game.containers));
};

Container.load = function() {
    var saved = playerStorage.getItem("containers");
    if (saved) {
        saved.filter(Entity.exists).map(Entity.get).forEach(Container.open);
    }
};

Container.bag = function() {
    var bag = game.player.bag();
    return (bag) ? Container.open(bag) : null;
};

Container.forEach = function(callback) {
    for (var i in game.containers) {
        var cnt = game.containers[i];
        callback(cnt);
    }
};

Container.prototype = {
    get visible() {
        return this.panel.visible;
    },
    set visible(v){
        this.panel.visible = v;
    },
    findSlot: function(entity) {
        var i = this._slots.indexOf(entity.Id);
        return (i != -1) ?  this.slots[i] : null;
    },
    forEach: function(callback)  {
        this.slots.forEach(callback);
    },
    filter: function(predicate) {
        return this.slots.filter((slot) => slot.entity).map((slot) => slot.entity).filter(predicate);
    },
    createContainerPanel: function() {
        var slots = dom.div("slots-wrapper");
        this._slots.forEach(function(id, i) {
            var slot = new ContainerSlot(this, i);
            this.slots.push(slot);
            slots.appendChild(slot.element);
        }.bind(this));

        switch (this.entity.Type) {
        case "poker-table":
        case "chess-table":
            slots.classList.add(this.entity.Type);
        }

        this.updateFuel();

        var contents = [
            slots,
            this.slots.length > 0 && this.fuel && dom.hr(),
            this.fuel,
        ];

        switch (this.entity.Type) {
        case "chess-table":
            contents.push(dom.button(T("Toggle color"), "", function() {
                slots.classList.toggle("chess-toggle");
            }))
            break;
        }

        this.panel = new Panel(
            "container-" + this.id,
            this.name,
            contents
        );

        const buttons = this.makeButtons();
        if (buttons) {
            dom.insert(buttons, this.panel.titleBar);
        }

        this.panel.entity = this.entity;
        this.panel.hooks.hide = () => this.markAllAsSeen();
        this.panel.hooks.show = () => {
            if (this._syncReq) {
                this.update();
                this._syncReq = false;
            }
        }
        this.panel.hooks.close = () => { delete game.containers[this.id]; };
        this.panel.element.classList.add("container");
        this.panel.container = this;

        this.panel.setWidth(this._slotsWidth * Container.SLOT_SIZE);
    },
    sort: function() {
        game.network.send("Sort", {Id: this.id});
    },
    makeButtons: function() {
        if (this.slots.length < 3) {
            return null;
        }

        const moveAll = dom.wrap("container-action", "⇥", {
            title: T("Move all"),
            onclick: () => {
                var top = this.getTopExcept(this.id);
                if (top) {
                    game.network.send("move-all", {From: this.id, To: top.id});
                    top.panel.toTop();
                }
            },
        });

        const sort = dom.wrap("container-action", "⇅", {
            title: T("Sort"),
            onclick: () => this.sort(),
        });

        const openAll = dom.wrap("container-action", "↥", {
            title: T("Open all"),
            onclick: () => {
                const containers = this.slots.filter(function(slot) {
                    return (slot.entity && slot.entity.isContainer());
                }).map(function(slot) {
                    return slot.entity;
                });
                const opened = containers.reduce(function(opened, entity) {
                    const cnt = Container.get(entity);
                    return (cnt && cnt.visible) ? opened + 1 : opened;
                }, 0);

                const open = opened < containers.length;
                containers.forEach(function(entity) {
                    const cnt = Container.open(entity);
                    if (open)
                        cnt.panel.show();
                    else
                        cnt.panel.hide();
                });
            }
        });

        return dom.wrap("container-actions", [moveAll, sort, openAll])
    },
    markAllAsSeen: function() {
        this.slots.forEach(function(slot) {
            slot.markAsSeen();
        });
    },
    // dwim want slot with entity
    dwim: function(slot) {
        if (!slot.entity) {
            console.log("dwim: got empty slot");
            return;
        }

        if (game.controller.craft.dwim(slot))
            return;

        var blank = game.controller.craft.blank;
        if (blank.panel && blank.panel.visible) {
            blank.dwim(slot.entity);
            return;
        }
        if (Panel.top.name == "blank-panel")
            return;

        var entity = slot.entity;
        var top = this.getTopExcept(entity.Container);
        if (top) {
            var equipped = (this.id == 0);
            if (!equipped  && game.controller.modifier.ctrl && game.controller.modifier.shift) {
                game.network.send("move-all", {
                    From: entity.Container,
                    To: top.id,
                    Type: entity.Type,
                });
            } else {
                Container.move(entity, top);
            }
            return;
        }

        entity.dwim();
    },
    init: function() {
        var entity = this.entity;
        var props = entity.Props;
        this._slots = props.Slots || [];
        this._slotsWidth = props.SlotsWidth;
        this._slotsHeight = props.SlotsHeight;
        this.name = TS(entity.Name);
    },
    // called on each Entity.sync()
    update: function() {
        this.sync();
        for (var i in this.slots) {
            var slot = this.slots[i];
            var id = this._slots[i];
            // slot is empty
            if (id == 0) {
                slot.clear();
                continue;
            }
            var entity = Entity.get(id);
            if (!entity) {
                // game.sendErrorf("Entity with id %d is not found in container %d", id, this.id);
                continue;
            }
            slot.set(entity);
        }

        this.updateFuel();
    },
    updateProgress: function() {
        this.slots.forEach(slot => slot.updateProgress());
    },
    syncReq: function() {
        this._syncReq = true;
    },
    sync: function() {
        this._slots = this.entity.Props.Slots;
    },
    updateFuel: function() {
        var fuel = this.entity.Fuel;
        if (!fuel)
            return;

        // fast route; update current value
        if (this.fuel) {
            this.fuel.update(fuel);
            return;
        }

        this.fuel = dom.wrap("fuel-wrapper", T("Fuel"), {title: T("Fuel")});

        var current = dom.div("fuel-current");
        var max = dom.div("fuel-max");
        var slot = dom.slot();
        slot.canUse = this.entity.canUse.bind(this.entity);
        slot.use = this.entity.use.bind(this.entity);

        var update = function(fuel) {
            current.style.width = (fuel.Current/fuel.Max)*100 + "%";
        };
        update(fuel);
        this.fuel.update = update;
        dom.append(this.fuel, [slot, current, max]);
    },
    hasSpace: function() {
        return this._slots.find(function(id) { return id == 0; }) !== undefined;
    },
    getTopExcept: function(except, allowFull = false) {
        for (var i = Panel.stack.length-1; i >= 0; i--) {
            var panel = Panel.stack[i];
            if (panel.visible &&
                panel.container &&
                panel.container.id != except &&
                (allowFull || panel.container.hasSpace())
               ) {
                return panel.container;
            }
        };
        return null;
    },
};
