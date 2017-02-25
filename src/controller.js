/* global Point, dom, config, util, T, TS, Container, Avatar, Effects, loader, ParamBar, Panel, CELL_SIZE, Character, gameStorage, playerStorage, ProgressBar */

"use strict";

function Controller(game) {
    var controller = this;
    this.ready = false;

    this.stats = null; // TODO: what is it?

    this.actionQueue = [];
    this.avatar = null;
    this.xpBar = new ParamBar("XP");
    this.effects = new Effects();

    this.LMB = 0;
    this.MMB = 1;
    this.RMB = 2;
    this.callback = [null, null, null];

    this.mouse = {
        // relative to window
        x: 0,
        y: 0,
        // relative to world element
        world: {
            x: 0,
            y: 0,
        },
        // can safely use mouse coordinates in game.network.send()
        isValid: function() {
            return controller.targetInWorld() &&
                this.world.x > 0 && this.world.y > 0 &&
                this.world.x < game.screen.width && this.world.y < game.screen.height;
        },
        point: function() {
            return new Point(this.x, this.y);
        }
    };

    this.world = {
        cursor: null,
        hovered: null, // entity under cursor
        menuHovered: null, //from X menu
        _p: new Point(),
        get point() {
            this._p.set(
                controller.mouse.world.x + game.camera.x,
                controller.mouse.world.y + game.camera.y
            ).toWorld();
            return this._p;
        },
        get x() {
            return this.point.x;
        },
        get y() {
            return this.point.y;
        },
    };

    this.modifier = {
        ctrl: false,
        shift: false,
        alt: false,
    };
    this.keys = {};
    this.currentTarget = null;
    this._hideStatic = false;
    this._drawMapGrid = false;

    this.lastAction = {
        type: "",
        rotation: 0,
        action: null,
        set(action, type = "") {
            this.action = action;
            this.type = type;
        },
        repeat() {
            this.action && this.action();
        },
    };

    this.actionProgress = new ProgressBar(game.interface);
    this.actionProgress.element.id = "action-progress-bar";

    this.targetContainer = document.getElementById("target-container");
    this.party = document.getElementById("party");

    this.hovered = null; // dom element under cursor

    this.cursor = {
        element: document.getElementById("cursor"),
        entity: null,
        isActive: function() {
            return this.entity != null;
        },
        clear: function() {
            this.entity = null;
            dom.clear(this.element);
        },
        set: function(entity, x, y, cleanup) {
            var icon = entity.icon();
            dom.clear(this.element);
            this.element.appendChild(icon);
            this.element.style.display = "block";
            this.element.style.left = x + "px";
            this.element.style.top = y + "px";
            this.element.style.marginLeft = -entity.getDrawDx() + "px";
            this.element.style.marginTop = -entity.getDrawDy() + "px";

            this.entity = entity;

            cleanup = cleanup || function(){};

            controller.callback[controller.RMB] = function(e) {
                cleanup();
                return true;
            };
            function callback(e) {
                var hovered = controller.hovered;
                if (hovered) {
                    if (controller.modifier.shift) {
                        game.chat.linkEntity(entity);
                        return true;
                    }

                    if (hovered.check && !hovered.check(controller.cursor))
                        return false;

                    if (hovered.canUse && hovered.canUse(entity)) {
                        return hovered.use(entity);
                    }

                    if (hovered.mail) {
                        cleanup = function(){};
                        return hovered.use(entity);
                    }

                    if (hovered.craft) {
                        cleanup = function(){};
                        return controller.craft.use(entity, hovered);
                    }

                    if (hovered.build)
                        return controller.craft.blank.use(entity);

                    if (hovered.vendor)
                        return hovered.use(entity, hovered);

                    if (hovered.containerSlot) {
                        var slot = hovered.containerSlot;
                        // dropped back to it's place
                        if (slot.entity == entity)
                            return true;

                        Container.move(entity, slot.container, slot.index);
                    }
                    return true;
                }

                hovered = controller.world.hovered;
                if (hovered && hovered.canUse) {
                    if (hovered.canUse(entity)) {
                        return hovered.use(entity);
                    }
                } else if (controller.mouse.isValid()) {
                    entity.drop();
                    return true;
                }
                return false;
            }
            controller.callback[controller.LMB] = function(e) {
                if (callback(e)) {
                    cleanup();
                    return true;
                }
                return false;
            };
        },
        update: function() {
            if (this.entity) {
                this.element.style.left = controller.mouse.x + "px";
                this.element.style.top = controller.mouse.y + "px";
            }
        },
        updateHovered: function() {
            dom.hide(this.element);
            var element = document.elementFromPoint(controller.mouse.x, controller.mouse.y);
            dom.show(this.element);

            var hovered = null;

            if (element.containerSlot)
                hovered = element.containerSlot.element; // slot.element not always == element
            else if (element.classList.contains("item-preview"))
                hovered = element.parentNode;
            else if (element.classList.contains("slot"))
                hovered = element;


            var oldHovered = controller.hovered;
            if (oldHovered != hovered) {
                if (oldHovered) {
                    oldHovered.classList.remove("hovered");
                    oldHovered.classList.remove("invalid");
                }
                if (hovered){
                    hovered.classList.add("hovered");
                    if (hovered.check && !hovered.check(controller.cursor))
                        hovered.classList.add("invalid");
                }
            }
            controller.hovered = hovered;
        },
    };

    this.actionButton = {
        handler: null,
        action: null,
        icon: null,
        inProgress: false,
        element: document.getElementById("main-action-button"),
        help: dom.wrap("action-help", T("Space")),
        active: function() {
            return this.handler && this.icon;
        },
        activate: function() {
            this.handler();
        },
        startProgress: function() {
            if (!this.inProgress && this.active()) {
                this.inProgress = true;
                this.element.classList.add("active");
            }
        },
        stopProgress: function() {
            if (this.inProgress && this.active()) {
                this.inProgress = false;
                this.element.classList.remove("active");
            }
        },
        setAction: function(action, handler) {
            if (action == this.action) {
                return;
            }
            this.reset();
            this.action = action;
            this.handler = handler;
            this.element.onclick = handler;
            this.loadIcon(action);
        },
        reset: function() {
            this.action = null;
            this.handler = null;
            this.element.onclick = null;
            dom.clear(this.element);
            this.icon = null;
            this.inProgress = false;
        },
        loadIcon: function(action) {
            this.icon = loader.loadImage("icons/tools/" + action + ".png");
            dom.setContents(this.element, [
                this.icon,
                this.help,
            ]);
        },
    };

    this.highlight = function(name, enable) {
        if (!(name in this))
            return;

        var button = this[name].panel.button;
        if (!button)
            return;

        if (enable)
            button.classList.add("alert");
        else
            button.classList.remove("alert");
    };

    this.makeHighlightCallback = function(buttonName, off) {
        return this.highlight.bind(this, buttonName, off);
    };

    var lastTickUpdate = Date.now();
    this.update = function() {
        if (this.targetContainer.avatar) {
            this.targetContainer.avatar.update();
        }

        if (this.party.avatars) {
            this.party.avatars.forEach(avatar => avatar.update());
        }

        this.updateCamera();
        if (this.world.cursor instanceof Entity || this.cursor.entity)
            document.body.classList.add("cursor-hidden");
        else
            document.body.classList.remove("cursor-hidden");

        if (this.world.hovered) {
            var e = Entity.get(this.world.hovered.Id);
            if (!e) //item removed
                this.world.hovered = null;
            else if (e instanceof Entity && !e.inWorld())
                this.world.hovered = null;
        }
        this.minimap.update();
        var now = Date.now();
        if (now - lastTickUpdate > 500) {
            this.avatar.update();
            this.effects.update();
            lastTickUpdate = now;
            _.forEach(game.containers, (cnt) => cnt.visible && cnt.updateProgress());
        }
    };

    this.updateItemInfo = function(entity) {
        var info = game.panels["item-info"];
        if (info && info.visible && (!entity || info.entity == entity)) {
            info.entity.showInfo();
        }
    };

    this.updateCamera = function() {
        var camera = game.camera;
        var screen = game.screen;
        var p = game.player.screen();
        camera.x = (p.x - screen.width / 2) << 0;
        camera.y = (p.y - screen.height / 2) << 0;
    };


    this.toggleBag = function() {
        var cnt = Container.bag();
        controller.highlight("inventory", false);
        if (cnt) {
            cnt.panel.button = controller.inventory.panel.button;
            cnt.panel.toggle();
        } else {
            controller.showWarning(T("You have no bag"));
        }
    };

    this.toggleAllBags = function() {
        if (this.toggleAllBags.containers) {
            this.toggleAllBags.containers.forEach(cnt => game.containers[cnt.id] && cnt.panel.show());
            this.toggleAllBags.containers = null;
            return;
        }
        const containers = _.filter(game.containers, (cnt) => cnt.panel.visible);
        this.toggleAllBags.containers = containers;
        containers.forEach(cnt => cnt.panel.hide());
    };

    this.updatePlayerAvatar = function(player) {
        this.avatar = new Avatar(player);
        dom.setContents(document.getElementById("player-avatar"), this.avatar.element);
    };

    this.wasd = function(x, y, up) {
        // if (game.player.Settings.Pathfinding)
        //     return;
        var p = this.wasd.point;
        if (p.isZero() && up)
            return;
        let v = p.clone().add({x: x, y: y}).clamp();
        if (p.equals(v))
            return;

        p.fromPoint(v);
        if (!config.character.rotateWasd) {
            v.x = p.y + p.x;
            v.y = p.y - p.x;
        }
        game.network.send("wasd", v.clamp().json());
    };

    this.wasd.point = new Point();

    this.hotkeys = {
        W: {
            callback() {
                this.wasd(0, -1);
            },
            help: "Go up",
        },
        S: {
            callback() {
                this.wasd(0, +1);
            },
            help: "Go down",
        },
        A: {
            callback() {
                this.wasd(-1, 0);
            },
            help: "Go left",
        },
        D: {
            callback() {
                this.wasd(+1, 0);
            },
            help: "Go right",
        },
        Q: {
            callback() {
                const cnt = Panel.top && Panel.top.container;
                cnt && cnt.sort();
            },
            help: "Sort top container",
        },
        R: {
            callback() {
                this.lastAction.repeat();
            },
            help: "Repeat last action",
        },
        Z: {
            allowedModifiers: ["shift"],
            callback() {
                if (this.modifier.shift) {
                    this.toggleHideStatic();
                }
            },
            help: "Hide big objects",
        },
        G: {
            callback() {
                this.toggleDrawpMapGrid();
            },
            help: "Toggle map grid drawing",
        },
        B: {
            callback: this.toggleAllBags,
            help: "Open bag",
        },
        I: {
            callback: this.toggleBag,
            help: "Open bag",
        },
        C: {
            toggle: "stats",
        },
        F: {
            toggle: "craft",
        },
        N: {
            toggle: "skills",
        },
        M: {
            toggle: "map",
        },
        H: {
            toggle: "help",
        },
        J: {
            toggle: "journal",
        },
        X: {
            button: "pick-up",
            callback() {
                game.player.pickUp();
            },
            help: "Pick up nearest item",
        },
        V: {
            "button": "lift",
            callback() {
                game.player.liftStart();
            },
            help: "Lift up nearest item",
        },
        T: {
            callback() {
                if (game.player.mount) {
                    game.network.send("dismount");
                } else {
                    const mounts = game.findCharsNear(game.player.X, game.player.Y)
                          .filter(c => c.Riding)
                          .sort((a, b) => a.distanceTo(self) - b.distanceTo(self));
                    if (mounts.length > 0) {
                        game.network.send("mount", {Id: mounts[0].Id});
                    }
                }
            },
            "help": "Mount/unmount"
        },
        9: { //tab
            callback() {
                game.player.selectNextTarget();
            },
            help: "Select next target",
        },
        13: { //enter
            callback() {
                game.controller.chat.activate();
            },
            help: "Open chat",
        },
        27: { //esc
            callback() {
                if (document.activeElement == game.chat.newMessageElement) {
                    game.controller.chat.deactivate();
                } else if(this.mouse.isValid()) {
                    game.player.setTarget(null);
                } else if (Panel.top) {
                    Panel.top.hide();
                }
            },
            help: "Close top window or unselect current target",
        },
        32: { //space
            allowedModifiers: ["shift"],
            button: "action",
            callback(e) {
                game.player.defaultAction();
            },
            help: "Use item in hands"
        },
        37: { // left
            callback() {
                this.rotate(-1);
            }
        },
        39: { // right
            callback() {
                this.rotate(+1);
            }
        },
        42: { // Print Screen
            callback() {
                var name = new Date().toISOString().slice(0, 19).replace("T", "_");
                this.takeScreenshot(name);
            },
        },
    };

    this.takeScreenshot = function(name) {
        if (!game.args["steam"]) {
            console.warn("Not supported");
            return;
        }
        var gui = require("nw.gui");
        var win = gui.Window.get();

        win.capturePage(function(img) {
            var base64Data = img.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            var fs = require("fs");
            var dir = "./screenshots/";
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            fs.writeFile(dir + name + ".png", base64Data, "base64", function(err) {
                console.log(err);
            });
        }, "png");
    };

    this.initHotkeys = function() {
        _.forEach(this.hotkeys, function(hotkey, key, hotkeys) {
            if (hotkey.toggle) {
                hotkeys[key].callback = function() {
                    game.panels[hotkey.toggle].toggle();
                };
            }
        });
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(key) {
            this.hotkeys[String(key).charCodeAt(0)] = {
                callback: function() {
                    if (game.menu.visible)
                        game.menu.activate(key);
                    else if (key > 0 && key <= 5)
                        this.fight.hotkey(key);
                }
            };
        }.bind(this));
    };

    this.makeHotbarButton = function({name, hotkey, description}, onclick) {
        const action = util.ucfirst(TS(name));
        const button = dom.wrap("button tooltip", [
            dom.make("i", hotkey),
            dom.make("span", [
                `${action} [${hotkey}]`,
                dom.make("small", description || action),
            ]),
            dom.img(`assets/icons/actions/${name}.png`, "icon"),

        ]);
        button.onclick = onclick;
        button.id = "action-button-" + name;
        return button;
    };

    this.initHotbar = function() {
        const hotbar = document.getElementById("action-hotbar");
        dom.append(hotbar, [
            this.makeHotbarButton({
                name: "pick-up",
                hotkey: "X",
            }, () => game.player.pickUp()),

            this.makeHotbarButton({
                name: "lift",
                hotkey: "V",
            }, () => game.player.liftStart()),

            this.makeHotbarButton({
                name: "detector",
                hotkey: "Ctrl+X",
            }, () => this.detector()),

            this.makeHotbarButton({
                name: "hide-static",
                hotkey: "Shift+Z",
            }, () => this.toggleHideStatic()),

            this.makeHotbarButton({
                name: "grid",
                hotkey: "G",
            }, () => this.toggleDrawpMapGrid()),
        ]);
        dom.append(document.getElementById("hotbars-container"), this.xpBar.element);
    };

    this.detector = function() {
        this.setClick(
            () => this.drawItemsMenu(),
            () => {
                game.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                game.iso.fillCircle(this.world.x, this.world.y, 2*CELL_SIZE);
            }
        );
    };

    this.fps = function() {
        return (this.fpsStats)
            ? this.fpsStats.currentFps()
            : 0;
    };

    this.fpsStatsBegin = function() {
        if (this.fpsStats)
            this.fpsStats.begin();
    };

    this.fpsStatsEnd =  function() {
        if (this.fpsStats)
            this.fpsStats.end();
    };

    this.initInterface = function() {
        game.map.minimapContainer.style.display = "block";
        game.timeElement.style.display = "block";

        if (config.graphics.movingSpace) {
            game.canvas.classList.add("animated");
        }

        function disableEvent(e) {
            e.preventDefault();
            return false;
        };

        window.addEventListener("mousedown", this.on.mousedown);
        window.addEventListener("mouseup", this.on.mouseup);
        window.addEventListener("mousemove", this.on.mousemove);
        window.addEventListener("keydown", this.on.keydown);
        window.addEventListener("keyup", this.on.keyup);
        window.addEventListener("wheel", this.on.wheel);

        window.addEventListener("contextmenu", disableEvent);
        window.addEventListener("dragstart", disableEvent);

        this.fight = new Fight();
        this.skills = new Skills();
        this.stats = new Stats();
        this.craft = new Craft();
        this.chat = game.chat = new Chat();
        this.minimap = new Minimap();
        this.journal = new Journal();
        this.system = new System();
        this.help = new Help();
        this.auction = new Auction();
        this.vendor = new Vendor();
        this.mail = new Mail();
        this.shop = new Shop();
        this.fpsStats = this.system.fps;
        this.inventory = {panel: {}};

        this.createButton(this.shop.panel, "shop");
        this.createButton(this.stats.panel, "stats");
        this.createButton(this.inventory.panel, "inventory");
        this.createButton(this.skills.panel, "skills");
        this.createButton(this.craft.panel, "craft");
        this.createButton(this.minimap.panel, "map");
        this.createButton(this.chat.panel, "chat");
        this.createButton(this.journal.panel, "journal");
        this.createButton(this.system.panel, "system");
        this.createButton(this.help.panel, "help");

        this.inventory.panel.button.onclick = this.toggleBag;

        this.initHotkeys();
        this.initHotbar();

        Container.load();

        this.ready = true;

        if (game.args["noui"]) {
            debug.map.world = false;
            dom.hide(game.world);
        }

        if (!config.graphics.centerScreen) {
            game.world.classList.add("snap-left");
        }
    };

    this.createButton = function(panel, buttonName) {
        buttonName = buttonName || panel.name;
        const button = dom.wrap("button", dom.img(`assets/icons/controls/${buttonName}.png`, "icon"));
        button.id = buttonName + "-button";
        button.title = TS(buttonName);
        button.onclick = () => panel.toggle();
        if (panel.visible) {
            button.classList.add("active");
        }
        panel.button = button;
        dom.append(document.getElementById("controls-bar"), button);
    };

    this.terraCursor = function(tile) {
        this.world.cursor = {
            scale: 1,
            id: tile.id,
            setPoint: function(){}, //TODO: fixme
            alignedData: function() {return null;},
            rotate: function(delta) {
                if (delta < 0)
                    this.scale++;
                else
                    this.scale--;
            },
            draw: function() {
                var size = CELL_SIZE;

                var p = game.controller.world.point.clone();
                p.x /= size;
                p.y /= size;
                p.floor();
                p.x *= size;
                p.y *= size;

                size *= this.scale;

                var s = p.clone().toScreen();

                game.ctx.drawImage(
                    tile,
                    0,
                    0,
                    CELL_SIZE * 2,
                    CELL_SIZE,
                    s.x - CELL_SIZE,
                    s.y,
                    CELL_SIZE * 2,
                    CELL_SIZE
                );

                game.ctx.strokeStyle = "#0ff";
                game.iso.strokeRect(
                    p.x,
                    p.y,
                    size,
                    size
                );
            }
        };
        this.callback[this.LMB] = function() {
            var p = game.controller.world.point.clone();
            p.x /= CELL_SIZE;
            p.y /= CELL_SIZE;
            p.floor();
            game.network.send("map-change-cell", {
                Id: parseInt(this.world.cursor.id),
                X: p.x,
                Y: p.y,
                Scale: this.world.cursor.scale,
            });
        };
    };

    this.newCreatingCursor = function(type, command, callback) {
        var entity = new Entity(type);
        entity.initSprite();
        return this.creatingCursor(entity, command, callback);
    };

    this.creatingCursor = function(entity, command = "entity-add", callback) {
        this.world.cursor = entity;

        if (this.lastAction.type != entity.Type)
            this.lastAction.rotation = 0;

        for (let i = 0; i < this.lastAction.rotation; i++) {
            this.world.cursor.rotate();
        }

        this.lastAction.set(() => {
            this.newCreatingCursor(entity.Type, command, callback);
        }, entity.Type);

        this.callback[this.LMB] = function() {
            if (!controller.mouse.isValid())
                return false;
            var p = entity.point;
            var data = entity.alignedData(p);
            if (data) {
                p.x = data.x + data.w/2;
                p.y = data.y + data.h/2;
            }
            var args = {
                type: entity.Type,
                x: p.x,
                y: p.y,
            };
            if (entity.Id)
                args.Id = entity.Id;
            if (entity.Orientation)
                args.Orientation = entity.Orientation;

            var pushToQueue = !!game.controller.modifier.shift;
            if (pushToQueue) {
                if (game.controller.actionQueue.length == 0 && !game.player.Action.Duration) {
                    game.network.send(command, args, game.controller.processActionQueue);
                } else {
                    game.controller.actionQueue.push({command: command, args: args});
                }
            } else {
                game.controller.actionQueue = [];
                game.network.send(command, args, callback);
                if (this.world.cursor instanceof Entity)
                    game.sortedEntities.remove(this.world.cursor);
            }

            this.clearCursors();
            return true;
        };
    };

    this.setClick = function(callback, draw) {
        this.callback[this.LMB] = function() {
            callback();
            this.clearCursors();
            return true;
        };
        if (draw) {
            this.world.cursor = {
                setPoint: function() {},
                alignedData: function(){},
                draw: draw,
            };
        }
    };

    this.processActionQueue = function process(data) {
        var action = game.controller.actionQueue.shift();
        if (!action)
            return null;
        game.network.send(action.command, action.args);
        return process;
    };

    this.resetAction = function() {
        game.network.queue = [];
        this.clearActionQueue();
        this.hideUnnecessaryPanels();
    };

    this.clearActionQueue = function(data) {
        game.controller.actionQueue = [];
    };
    this.hideUnnecessaryPanels = function() {
        ["fishing"].forEach(function(name) {
            var panel = game.panels[name];
            panel && panel.hide();
        });
    };

    this.clearCursors = function() {
        // clicking on player launches action, so don't cancel it
        if (this.world.hovered != game.player)
            this.world.cursor = null;

        this.world.hovered = null;
        this.hovered = null;
        this.cursor.clear();
    };

    this.targetInWorld = function(target) {
        target = target || this.currentTarget;
        return target == game.canvas || target == game.interface;
    };

    // this. is bound to controller
    this.on = {
        mousedown: function(e) {
            var x = e.pageX - game.offset.x + game.camera.x;
            var y = e.pageY - game.offset.y + game.camera.y;

            if (this.callback[e.button] != null) { // if callback for button is set
                if(!this.callback[e.button].call(this, e)) //if callback didn't handled click
                    return false; //skip this click
                this.clearCursors();
            } else {
                switch(e.button) {
                case this.LMB:
                    if (this.targetInWorld(e.target)) {
                        if(this.world.hovered) {
                            if (this.modifier.shift && !this.modifier.ctrl) {
                                game.chat.linkEntity(this.world.hovered);
                                return false;
                            }
                            if (game.player.IsAdmin && game.debug.entity.logOnClick) {
                                console.log(this.world.hovered);
                            }
                            return this.world.hovered.defaultAction(true);
                        } else if (this.modifier.alt && game.player.IsAdmin) {
                            game.network.send("teleport", {X: this.world.x, Y: this.world.y});
                        } else if(!this.world.cursor) {
                            game.player.onclick(this.world.x, this.world.y);
                        }
                    }
                    // close context menu when click is not on the menu item
                    if (!e.target.classList.contains("action"))
                        game.menu.hide();
                    break;
                case this.MMB:
                    if (this.targetInWorld(e.target)) {
                        e.preventDefault();
                        game.player.setDst(this.world.x, this.world.y, false);
                        return false;
                    }
                    break;
                case this.RMB:
                    game.player.setTarget(null);
                    if (this.world.hovered == game.player) {
                        return this.world.hovered.defaultAction();
                    } else if (this.world.hovered && this.targetInWorld()) {
                        if (!game.menu.show(this.world.hovered)) {
                            game.menu.hide();
                        }
                    } else if(!e.target.classList.contains("item") && !e.target.classList.contains("slot")){
                        game.menu.hide();
                    }
                    break;
                }
            }

            for(var i = this.LMB; i <= this.RMB; i++) {
                this.callback[i] = null;
            }

            dom.removeClass(".hovered", "hovered");
            dom.removeClass(".invalid", "invalid");
            return false;
        },
        mouseup: function(e) {
            switch(e.button) {
            case 2:
                this.clearCursors();
                break;
            }
        },
        mousemove: function(e) {
            this.currentTarget = e.target;
            this.mouse.world.x = e.pageX - game.offset.x;
            this.mouse.world.y = e.pageY - game.offset.y;
            this.mouse.x = e.pageX;
            this.mouse.y = e.pageY;
            this.cursor.update();
            this.updateHovered();
        },
        wheel: function(e) {
            this.rotate(e.deltaY);
        },
        keydown: function(e) {
            //on double keydown kill xneur
            this.modifier.ctrl = e.ctrlKey;
            this.modifier.shift = e.shiftKey;
            this.modifier.alt = e.altKey;
            var c = String.fromCharCode(e.keyCode);

            if (e.ctrlKey) {
                switch (e.keyCode) {
                case 67:
                    return true; // ctrl+c
                default:
                    controller.updateHovered();
                }
            }

            var esc = e.keyCode == 27;
            if (!esc) {
                if(e.target.id == "new-message") {
                    return this.chat.keydown(e);
                }
                if (e.target.nodeName == "INPUT")
                    return true;
                if (e.target.nodeName == "TEXTAREA")
                    return true;
            }

            this.keys[c] = true;

            var hotkey = this.hotkeys[e.keyCode] || this.hotkeys[c];
            if (hotkey) {
                e.preventDefault();
                e.stopPropagation();

                for (var mod in this.modifier) {
                    if (!this.modifier[mod])
                        continue;
                    if (!hotkey.allowedModifiers || hotkey.allowedModifiers.indexOf(mod) == -1)
                        return false;
                }
                hotkey.callback.call(this, e);
            }
            return false;
        },
        keyup: function(e) {
            this.modifier.ctrl = e.ctrlKey;
            this.modifier.shift = e.shiftKey;
            this.modifier.alt = e.altKey;
            var c = String.fromCharCode(e.keyCode);
            this.keys[c] = false;
            switch (c) {
            case "W":
                this.wasd(0, +1, true);
                break;
            case "S":
                this.wasd(0, -1, true);
                break;
            case "A":
                this.wasd(+1, 0, true);
                break;
            case "D":
                this.wasd(-1, 0, true);
                break;
            }
            return true;
        },
    };

    for (var eventName in this.on) {
        this.on[eventName] = this.on[eventName].bind(this);
    }

    this.rotate = function(delta) {
        var cursor = this.world.cursor;
        if (!cursor)
            return;
        cursor.rotate(delta);
        this.lastAction.rotation += delta;
    };


    this.updateHovered = function() {
        if (this.world.menuHovered || this.world.cursor)
            return;
        if (this.cursor.isActive()) {
            this.cursor.updateHovered();
        }
        var p = this.world.point;
        this.world.hovered = game.sortedEntities.findReverse(function(entity) {
            // check Disposition to allow "waypoints" to be easily selected
            return !entity.visibiliyObstacle && entity.intersects(p.x, p.y);
        });
    };

    this.drawAlign = function(entity, p) {
        var data = entity.alignedData(p);
        if (data) {
            game.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            game.iso.fillRect(data.x, data.y, data.w, data.h);
            game.ctx.strokeStyle = "#00ffff";
            game.iso.strokeRect(data.x, data.y, data.w, data.h);
            var fill = data.fill;
            if (fill) {
                game.ctx.fillStyle = fill.color;
                game.iso.fillRect(data.x - fill.w/2, data.y - fill.h/2, fill.w, fill.h);
                game.iso.strokeRect(data.x - fill.w/2, data.y - fill.h/2, fill.w, fill.h);
            }
        }
    };

    this.draw = function() {
        if (this.world.menuHovered) {
            this.world.menuHovered.drawHovered();
            return;
        }
        var cursor = this.world.cursor;
        var hovered = this.world.hovered;
        if (cursor) {
            if (cursor.Sprite) {
                if (this.modifier.shift && cursor.Sprite._align) {
                    cursor.Sprite.Align = cursor.Sprite._align;
                } else if (!cursor.Sprite.Align.X) {
                    cursor.Sprite = JSON.parse(JSON.stringify(cursor.Sprite));
                    cursor.Sprite._align = cursor.Sprite.Align;
                    cursor.Sprite.Align = {X: CELL_SIZE/2, Y: CELL_SIZE/2};
                }
            }

            cursor.setPoint(this.world.point);
            cursor.draw();
            this.drawAlign(cursor, this.world.point);
        } else if (hovered) {
            // If non-interface element (like menu) is over
            // and item is not outside of the visible area
            if (!this.hovered && this.mouse.isValid()) {
                hovered.drawHovered();
            }
        }
        var entity = this.cursor.entity;
        if (entity) {
            this.drawAlign(entity, this.world.point);
        }

        Character.drawActions();
        if (this.modifier.ctrl && this.keys.X && !game.menu.visible) {
            this.drawItemsMenu();
        }
    };

    this.drawItemsMenu = function() {
        var items = game.findItemsNear(this.world.x, this.world.y);
        items.push.apply(items, game.findCharsNear(this.world.x, this.world.y));
        if (items.length == 0)
            return;

        var actions = {};
        items.forEach(function(item) {
            var name = item.Name || item.Type;
            while (name in actions) {
                name = name + " "; //TODO: (fixme)dirty hack for objects of the same type
            }
            actions[name] = {
                item: item,
                callback: function() {
                    game.menu.show(item, false, true);
                }
            };
        });
        game.menu.show(actions);
    };

    this.showMessage = function(message, duration = 2500) {
        const record = dom.div("info-message", {text: message});
        document.getElementById("messages").appendChild(record);
        setTimeout(function() {
            dom.remove(record);
        }, duration);

    };

    this.showError = function(message) {
        showMessage(message, "error");
    };

    this.showWarning = function(message) {
        showMessage(message, "warning");
    };

    function showMessage(message, cls) {
        var warn = document.getElementById("warning");
        warn.textContent = TT(message);
        if(warn.timeout)
            clearTimeout(warn.timeout);
        warn.style.display = "inline-block";
        warn.className = cls || "";
        warn.timeout = setTimeout(function() {
            warn.style.display = "none";
            clearTimeout(warn.timeout);
            warn.timeout = null;
        }, 5000);

        if (game.chat)
            game.chat.addMessage(warn.textContent);
    };


    var announcement = document.getElementById("announcement");
    this.showAnnouncement = function(message) {
        announcement.textContent = message;
        if(announcement.timeout)
            clearTimeout(announcement.timeout);
        announcement.style.display = "inline-block";
        announcement.timeout = setTimeout(function() {
            if (game.stage.name != "main")
                return;
            announcement.style.display = "none";
            clearTimeout(announcement.timeout);
            announcement.timeout = null;
        }, 5000);
    };

    Object.defineProperty(this, "hideStatic", {
        get() {
            if (this._hideStatic)
                return !this.keys.Z;
            else
                return this.keys.Z;

        }
    });

    this.toggleHideStatic = function() {
        this._hideStatic = !this._hideStatic;
        document.getElementById("action-button-hide-static").classList.toggle("active");
    };

    Object.defineProperty(this, "drawMapGrid", {
        get() {
            return this._drawMapGrid;
        }
    });

    this.toggleDrawpMapGrid = function() {
        this._drawMapGrid = !this._drawMapGrid;
        document.getElementById("action-button-grid").classList.toggle("active");
    };

    this.reset = function() {
        gameStorage.clear();
        playerStorage.clear();
        game.panels = {}; //dont save positions;
        game.reload();
    };

    this.addPlayer = function(name) {
        if (controller.system)
            controller.system.users.addPlayer(name);
    };

    this.removePlayer = function(name) {
        if (controller.system)
            controller.system.users.removePlayer(name);
    };

    this.syncMinimap = function(data) {
        if (!this.minimap)
            return;
        this.minimap.sync(data);
    };

    this.updateVisibility = function() {
        for (var name in game.panels) {
            var panel = game.panels[name];
            panel.updateVisibility();
        }
    };

    var bg = {
        el: document.getElementById("bg-state"),
        panel: null,
        statFieldNames: ["Kills", "Death", "Captures", "Releases", "Dmg done", "Dmg acpt"].map(T),
        statFields: ["Kills", "Death", "Captures", "Releases", "DamageDone", "DamageAccepted"],
        makeStatRows: function(stats) {
            return _.map(stats, function(row, playerName) {
                return [playerName].concat(bg.statFields.map(function(field) {
                    return dom.text(row[field]);
                }));
            });
        },
    };

    this.updateBG = function(data) {
        if (!bg.panel) {
            bg.panel = new Panel("bg-stats", "Battleground", []);
            bg.el.onclick = bg.panel.toggle.bind(bg.panel);
        }
        if (data == "exit") {
            dom.hide(bg.el);
            bg.panel.hide();
            return;
        }

        dom.show(bg.el);
        var timer = null;

        if (data.Final) {
            var result = "draw";
            if (data.Red.Score > data.Blue.Score)
                result = "red team wins!";
            else if (data.Blue > data.Red)
                result = "blue team wins!";

            controller.showAnnouncement(TT("Match ended: {result}", {result: result}));
        } else {
            timer = dom.div("remaining", {text: util.formatTime(data.Remaining)});
            setTimeout(function tick() {
                timer.textContent = util.formatTime(--data.Remaining);
                setTimeout(tick, 1000);
            }, 1000);
        }

        dom.setContents(bg.el, [
            dom.wrap("red-points", (data.Red.Points || []).join(" | ")),
            Character.flags.red.image.cloneNode(),
            dom.span(data.Red.Score, "red-team", T("Red team score")),
            " vs ",
            dom.span(data.Blue.Score, "blue-team", T("Blue team score")),
            Character.flags.blue.image.cloneNode(),
            dom.wrap("blue-points", (data.Blue.Points || []).join(" | ")),
            timer,
        ]);

        bg.panel.setContents([
            dom.wrap("red-team", [
                dom.table(
                    [[Character.flags.red.image.cloneNode(), T("Name")]].concat(bg.statFieldNames),
                    bg.makeStatRows(data.Red.Stats)
                )
            ]),
            dom.wrap("blue-team", [
                dom.table(
                    [[Character.flags.blue.image.cloneNode(), T("Name")]].concat(bg.statFieldNames),
                    bg.makeStatRows(data.Blue.Stats)
                )
            ])
        ]);
    };

    this.wantShot = function() {
        return (this.modifier.ctrl && this.actionButton.action == "bow");
    };

    this.updateActiveQuest = function() {
        var questPanel = game.panels.quest;
        if (questPanel && questPanel.visible)
            questPanel.quest.update();
    };

    this.updateMail = function(newMail) {
        if (newMail) {
            dom.show(document.getElementById("new-mail"));
            this.mail && this.mail.update();
            return;
        }
        dom.hide(document.getElementById("new-mail"));
    };

    this.updateCombo = function(waza) {
        if (this.fight && config.ui.comboHelper) {
            this.fight.combo.sync(waza);
        }
    };

    this.iterateContainers = function(callback) {
        var checked = {};
        var bag = Container.bag();
        if (bag) {
            check(bag);
        }

        Container.forEach(function(container) {
            if (container.visible || container.entity.belongsTo(game.player)) {
                check(container);
            }
        });

        function check(container) {
            if (checked[container.id])
                return;
            checked[container.id] = true;
            container.update();
            var containers = [];
            container.forEach(function(slot) {
                if (!slot.entity)
                    return;

                callback(slot, container);
                if (slot.entity.isContainer()) {
                    containers.push(Container.open(slot.entity));
                }
            });
            containers.forEach(check);
        }
    };

    this.ping = 0;
    this.updatePing = function(ping) {
        this.ping = ping;
        this.system && this.system.update(ping);
    };

    var blinkingWarning = dom.div("#blinking-warning-message");
    dom.append(document.getElementById("blinking-warning"), blinkingWarning);
    dom.hide(blinkingWarning);

    this.setBlinkingWarning = _.throttle(function(message) {
        if (message) {
            dom.show(blinkingWarning);
            blinkingWarning.textContent = message;
        } else {
            dom.hide(blinkingWarning);
        }
    }, 300, {trailing: true});
};
