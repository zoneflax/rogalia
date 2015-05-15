function Character(id, name) {
    this.Id = id;
    this.Name = name;
    this.x = 0;
    this.y = 0;

    this.Hp = null;
    this.Invisible = false;

    //used to show animation of varius type, like damage deal or exp gain
    this.info = [];
    this.Messages = null;
    this.PrivateMessages = null;

    //Character in pvp cannot move and do other actions
    this.pvp = false;

    this.Dst = {
        X: 0,
        Y: 0,
    };
    this.dst = {
        x: 0,
        y: 0,
        time: null,
        radius: 0,
    };

    this.target = null;

    this.Dx =  0;
    this.Dy = 0;
    this.Radius = CELL_SIZE / 4;
    this.isMoving = false;
    this.Speed = {Current: 0};
    this.Equip = [];

    this.IsNpc = false;

    this.Burden = 0;
    this.burden = null;

    this.Effects = {};
    this.Clothes = [];

    this.Settings = {
        Pathfinding: true,
    };

    this.ballon = null;
    this.shownEffects = {};
    this.isPlayer = (this.Name == game.login);

    this.Action = {};
    this.action = {
        progress: 0,
        last: 0,
    };

    this.speed = 1;
    this.sprites = {};
    Character.animations.forEach(function(animation) {
        var s = new Sprite();
        s.name = animation;
        this.sprites[animation] = s;
    }.bind(this));
    this.sprite = this.sprites.idle;

    this._parts = "";
}

Character.prototype = {
    get X() {
        return this.x;
    },
    get Y() {
        return this.y;
    },
    set X(x) {
        if (this.x == x)
            return;
        if (this.Dx == 0 || this.Settings.Pathfinding || Math.abs(this.x - x) > CELL_SIZE) {
            game.sortedEntities.remove(this);
            this.x = x;
            game.sortedEntities.add(this);
        }
    },
    set Y(y) {
        if (this.y == y)
            return;
        if (this.Dy == 0 || this.Settings.Pathfinding || Math.abs(this.y - y) > CELL_SIZE) {
            game.sortedEntities.remove(this);
            this.y = y;
            game.sortedEntities.add(this);
        }
    },
    leftTopX: Entity.prototype.leftTopX,
    leftTopY: Entity.prototype.leftTopY,
    sortOrder: function() {
        return  this.Y + this.X;
    },
    screen: function() {
        return new Point(this.X, this.Y).toScreen();
    },
    sync: function(data, init) {
        Character.copy(this, data);

        this.burden = (this.Burden) ? Entity.get(this.Burden) : null;

        this.syncMessages(this.Messages);
        this.syncMessages(this.PrivateMessages);

        if (!init && JSON.stringify(this.getParts()) != this._parts)
            this.reloadSprite();

        if (data.Dir !== undefined)
            this.sprite.position = data.Dir;
    },
    syncMessages: function(messages) {
        while(messages && messages.length > 0) {
            var message = messages.shift();
            this.info.push(new Info(message, this));
        }
    },
    reloadSprite: function() {
        for (var i in this.sprites) {
            this.sprites[i].ready = false;
        }
        this.loadSprite();
    },
    init: function(data) {
        //TODO: refactor
        this.IsNpc = data.Type != "man";
        this.sync(data, true);
        this.loadSprite();
    },
    initSprite: function() {
        this.sprite.speed = 14000;
        this.sprite.offset = this.Radius;
        this.sprite.angle = Math.PI/4;
	switch (this.Type) {
	case "kitty":
	    this.sprite.width = 64;
	    this.sprite.height = 64;
            this.sprite.frames = {
                "idle": 3,
                "run": 4,
            };
            break;
	case "chicken":
	    this.sprite.width = 30;
	    this.sprite.height = 29;
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 3],
            };
            break;
        case "dog":
	case "cat":
	case "pony":
	case "cow":
	case "sheep":
	case "wolf":
	case "butterfly":
	    this.sprite.width = 32;
	    this.sprite.height = 32;
            this.sprite.angle = Math.PI/2;
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 3],
            };
            break;
	case "horse":
	    this.sprite.width = 80;
	    this.sprite.height = 80;
            this.sprite.angle = Math.PI/2;
            this.sprite.speed = 21000;
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 4],
            };
            break;
	case "rabbit":
	    this.sprite.width = 23;
	    this.sprite.height = 37;
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 2],
            };
            break;
	case "jesus":
	    this.sprite.width = 64;
	    this.sprite.height = 96;
            this.sprite.frames = {
                "idle": 4,
                "run": 8,
            };
            break;
        case "charles":
	    this.sprite.width = 40;
	    this.sprite.height = 70;
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 1,
                "run": 0,
            };
            break;
	case "desu":
	    this.sprite.width = 68;
	    this.sprite.height = 96;
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 4,
                "run": 0,
            };
            break;
        case "abu":
	    this.sprite.width = 128;
	    this.sprite.height = 128;
            this.sprite.angle = Math.PI/2;
            this.sprite.frames = {
                "idle": 1,
                "run": 3,
            };
            break;
        case "mocherator":
	    this.sprite.width = 40;
	    this.sprite.height = 40;
            this.sprite.angle = Math.PI/2;
            this.sprite.frames = {
                "idle": 1,
                "run": 3,
            };
            break;
        case "omsk-overlord":
	    this.sprite.width = 128;
	    this.sprite.height = 128;
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 0,
                "run": 0,
            };
            break;
        case "omsk":
	    this.sprite.width = 40;
	    this.sprite.height = 40;
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 0,
                "run": 0,
            };
            break;
	case "ufo":
	    this.sprite.width = 64;
	    this.sprite.height = 64;
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 3,
                "run": 0,
            };
            break;
        case "wyvern":
	    this.sprite.width = 256;
	    this.sprite.height = 256;
            this.sprite.frames = {
                "idle": 4,
                "run": 4,
            };
            this.speed = 20000;
            break;
        case "daemon":
	    this.sprite.width = 214;
	    this.sprite.height = 136;
            this.sprite.frames = {
                "idle": 3,
                "run": 4,
            };
            this.speed = 20000;
            break;
	case "naked-ass":
	    this.sprite.width = 64;
	    this.sprite.height = 96;
            this.sprite.frames = {
                "idle": 2,
                "run": [0, 6],
            };
            break;
	case "red-hair":
	    this.sprite.width = 64;
	    this.sprite.height = 96;
            this.sprite.frames = {
                "idle": 1,
                "run": 3,
            };
            break;
        case "cirno":
        case "snegurochka":
        case "moroz":
        case "vendor":
        case "boris":
        case "bruno":
            this.sprite.nameOffset = 96;
            this.sprite.frames = {
                "idle": 1,
                "run": 1,
            };
            break;
	default:
            this.sprite.nameOffset = 72;
            this.sprite.offset = 2*this.Radius;
	    this.sprite.width = 96;
	    this.sprite.height = 96;
	    this.sprite.speed = 7000;
	}
        if (!this.sprite.nameOffset)
            this.sprite.nameOffset = this.sprite.height;
    },
    loadSprite: function() {
        var sprite = this.sprite;
        if (sprite.loading)
            return;

        this.initSprite();

        if (this.IsNpc) {
            this.loadNpcSprite();
            return;
        }

        sprite.loading = true;

        var animation = sprite.name;
        var dir = Character.spriteDir + this.Type + "/";
        var parts = this.getParts();
        this._parts = JSON.stringify(parts);
        parts.forEach(function(part) {
            var path = dir + animation + "/" + part.type + "/" + part.name + ".png";
            part.image = loader.loadImage(path);
        });
        if (sprite.name == "attack") {
            var weapon = Character.weaponSprites.sword;
            if (weapon)
                parts.push({image: weapon.image});
        }


        var self = this;
        loader.ready(function() {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var naked = Character.nakedSprites[animation];
            canvas.width = naked.image.width;
            canvas.height = naked.image.height;
            ctx.drawImage(naked.image, 0, 0);
            parts.forEach(function(part, i) {
                var image = part.image;
                if (image && image.width > 0) {
                    if (part.color && part.opacity) {
                        image = ImageFilter.tint(image, part.color, part.opacity);
                    }
                    ctx.drawImage(image, 0, 0);
                }
            });

            sprite.image = canvas;
            sprite.makeOutline();
            sprite.ready = true;
            sprite.loading = false;
            Stats.update();
        });
    },
    loadNpcSprite: function() {
        var type = this.Type;
        switch (this.Name) {
        case "Margo":
            type = "margo";
            break;
        case "Umi":
            type = "umi";
            break;
        case "Shot":
            type = "shot";
            break;
        default:
            switch (this.Type) {
            case "vendor":
                type = "vendor-" + ([].reduce.call(this.Name, function(hash, c) {
                    return hash + c.charCodeAt(0);
                }, 0) % 3 + 1);
                break;
            }
        }
        this.sprite.load(Character.spriteDir + type + ".png");
    },
    getActions: function() {
        var actions = {};
        switch (this.Type) {

        case "moroz":
        case "snegurochka":
            actions = {
                "Tell me the rules": function() {
                    game.chat.addMessage({From: name, Body: game.talks.rules.presents, Channel: 9});
                    game.controller.highlight("chat");
                },
                "Gimme a present!": function() {
                    if (confirm("I'll take your atoms. Okay?"))
                        game.network.send("ask-for-present", {Id: this.Id});
                }
            };
            break;
        case "rabbit":
        case "chicken":
            actions = {
                "Catch": function() {
                    game.network.send("catch-animal", {Id: this.Id});
                }
            };
        default:
            if (this.Riding) {
                actions = {
                    "Mount": function() {
                        game.network.send("mount", {Id: this.Id});
                    },
                    "Dismount": function() {
                        game.network.send("dismount");
                    },
                };
            }
        }

        var common = {
                Select:  function() {
                    game.player.target = this;
                }.bind(this)
        };
        if (this.isInteractive()) {
            common.Interact =  this.interact;
        }

        return [common, actions];
    },
    defaultAction: function(targetOnly) {
        if (this.isInteractive()) {
            this.interact();
        } else {
            if (!targetOnly && this.isPlayer && game.controller.iface.actionButton.state != "")
                game.controller.iface.actionButton.click();
            else if (this != game.player || config.allowSelfSelection)
                game.player.target = this;
        }
    },
    drawAction: function() {
        if(this.Action.Duration) {
            if (this.isPlayer) {
                game.controller.iface.actionProgress.value = this.action.progress;
            } else {
                game.ctx.strokeStyle = "orange";
                game.ctx.beginPath();
                var p = this.screen();
                game.ctx.arc(p.x, p.y, CELL_SIZE, 0, this.action.progress);
                game.ctx.stroke();
            }
        }
    },
    see: function(character) {
        if (this == character)
            return true;
        var len_x = character.X - this.X;
        var len_y = character.Y - this.Y;
        return util.distanceLessThan(len_x, len_y, Math.hypot(game.screen.width, game.screen.height));
    },
    setDst: function(x, y) {
        if (this.Disabled || this.Waza.Active)
            return;
        var leftBorder, rightBorder, topBorder, bottomBorder;
        leftBorder = this.Radius;
	topBorder = this.Radius;
	rightBorder = game.map.full.width - this.Radius;
	bottomBorder = game.map.full.height - this.Radius;

        if (x < leftBorder) {
            x = leftBorder;
        } else if (x > rightBorder) {
            x = rightBorder;
        }

        if (y < topBorder) {
            y = topBorder;
        } else if (y > bottomBorder) {
            y = bottomBorder;
        }

        if (x == this.Dst.X && y == this.Dst.Y)
            return;

        game.network.send("set-dst", {x: x, y: y}, game.player.resetAction);

        this.dst.x = x;
        this.dst.y = y;
        this.dst.radius = 9;
        this.dst.time = Date.now();

        if (!this.Settings.Pathfinding)
            this._setDst(x, y);
    },
    _setDst: function(x, y) {
        var len_x = x - this.X;
        var len_y = y - this.Y;
        var len  = Math.hypot(len_x, len_y);

        this.Dst.X = x;
        this.Dst.Y = y;

        this.Dx = len_x / len;
        this.Dy = len_y / len;
    },
    resetAction: function(data) {
        game.controller.resetAction(data);
    },
    getDrawPoint: function() {
        var p = this.screen();
        var dy = (this.mount) ? this.mount.sprite.height/2 : 0;
        return {
            p: p,
            x: Math.round(p.x - this.sprite.width / 2),
            y: Math.round(p.y - this.sprite.height + this.sprite.offset) - dy
        };
    },
    draw: function() {
        if (this.Invisible)
            return;
        if (!game.player.see(this))
            return;
        this.drawDst();

        if (this.sprite.ready) {
            var p = this.getDrawPoint();
            var s = this.screen();
            var up = this.animation && this.animation.up;
            var down = this.animation && this.animation.down;
            if (down) {
                var downPoint = new Point();
                downPoint.x = s.x - down.width/2;
                downPoint.y = p.y + this.sprite.height + this.sprite.offset - down.height;
                down.draw(downPoint);
                down.animate();
                if (down.frame == 0) { //finished
                    this.animation.down = null;
                }
            }

            // drawing character model
            this.sprite.draw(p);

            if (up) {
                var upPoint = new Point();
                upPoint.x = s.x - up.width/2;
                upPoint.y = p.y + this.sprite.height + this.sprite.offset - up.height;
                up.draw(upPoint);
                up.animate();
                if (up.frame == 0) { //finished
                    this.animation.up = null;
                }
            }


            if (this != game.controller.world.hovered && this == game.player.target)
                this.drawHovered();
        }
    },
    drawUI: function() {
        if (!game.player.see(this))
            return;

        if (game.debug.player.box) {
            this.drawBox();
        }

        //else drawn in controller
        if (this != game.controller.world.hovered && this != game.player.target) {
            this.drawName();
        }

        this.info.forEach(function(info) {
            info.draw();
        });

        if(game.debug.player.position) {
            game.ctx.fillStyle = "#fff";
            var text = "(" + Math.floor(this.X) + " " + Math.floor(this.Y) + ")";
            var x = this.X - game.ctx.measureText(text).width / 2;
            game.drawStrokedText(text, x, this.Y);
        }

    },
    drawDst: function() {
        if (debug.player.path && this.Path) {
            var r = 2;
            game.ctx.fillStyle = "#f00";
            this.Path.forEach(function(p) {
                game.iso.fillRect(p.X-r, p.Y-r, 2*r, 2*r);
            })
        }
        if (this.dst.radius <= 0)
            return;
        var now = Date.now();
        if (this.dst.time + 33 > now) {
            game.ctx.strokeStyle = "#fff";
            game.ctx.beginPath();
            var p = new Point(this.dst.x, this.dst.y).toScreen()
            game.ctx.arc(p.x, p.y, this.dst.radius--, 0, Math.PI * 2);
            game.ctx.stroke();
            this.dst.time = now;
        }
    },
    drawBox: function() {
        var p = this.screen();
        game.ctx.strokeStyle = "cyan";
        game.iso.strokeRect(this.leftTopX(), this.leftTopY(), this.Width, this.Height)
        game.iso.strokeCircle(this.X, this.Y, this.Radius);

        // game.ctx.beginPath();
        // game.ctx.fillStyle = "black";
        // game.ctx.beginPath();
        // game.ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        // game.ctx.fill();

        // game.ctx.fillStyle = "#fff";
        // game.ctx.beginPath();
        // game.ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        // game.ctx.fill();
    },
    drawName: function(drawHp, drawName) {
        if (this.Invisible)
            return;

        var name = this.Name;
        if (this.IsNpc) {
            switch (name) {
                default:
                name = name.replace(/-\d+$/, "");
            }
            name = T(name);
        }

        if (this.Name == "Benedict")
            name = "Benedict the Fallen Priest";

        if (this.Fame == 10000) {
            name = "Lord " + name;
        }

        if ("Citizenship" in this && this.Citizenship.Faction) {
            name += " {" + this.Citizenship.Faction[0] + "}";
        }
        if (game.controller.modifier.shift) {
            name += " | " + T("Lvl") + ": " + this.Lvl;
            name += " | " + ["♀", "♂"][this.Sex];
        }

        var p = this.screen();
        var y = p.y - this.sprite.nameOffset;
        var dy = FONT_SIZE * 0.8;

        drawHp = drawHp || ((!this.IsNpc || game.config.ui.npc) && game.config.ui.hp);
        drawName = drawName || ((!this.IsNpc || game.config.ui.npc) && game.config.ui.name);

        if (this.PvpExpires) {
            var pvpExpires = new Date(this.PvpExpires * 1000);
            var diff = pvpExpires - Date.now();
            // blink when less then 3 sec
            if (diff > 0 && (diff > 3e3 || diff % 1000 < 500)) {
                game.ctx.fillStyle = "red";
                var x = p.x - game.ctx.measureText("pvp").width / 2;
                var pdy = 0;
                if (drawHp)
                    pdy += dy;
                if (drawName)
                    pdy += dy;
                game.drawStrokedText("pvp", x, y - pdy);
            }
        }

        if (!drawHp && !drawName)
            return;

        var x = p.x - game.ctx.measureText(name).width / 2;

        if (drawHp) {
            var w = 64;
            //full red rect
            game.ctx.fillStyle = '#c33';
            game.ctx.fillRect(p.x - w/2, y, w, dy); //wtf

            //green hp
            game.ctx.fillStyle = '#3c3';
            game.ctx.fillRect(p.x - w/2, y, w * this.Hp.Current / this.Hp.Max, dy); //wtf
        } else {
            dy = 0;
        }
        if (drawName) {
            game.ctx.fillStyle = (this.Karma < 0)
                ? "#f00"
                : ((this == game.player) ? "#ff0" : "#fff");
            game.drawStrokedText(name, x, y - dy / 2);
        }
    },
    idle: function() {
        return this.Dx == 0 && this.Dy == 0 && this.Action.Name == "";
    },
    animate: function() {
        var animation = "idle";
        if(this.Dx || this.Dy) {
            animation = "run";
            if (!this.IsNpc)
                this.sprite = this.sprites["run"];

            var sector = (this.mount) ? this.mount.sprite.angle : this.sprite.angle;
            var sectors = 2*Math.PI / sector;
            var angle = Math.atan2(-this.Dy, this.Dx);
            var index = Math.round(angle / sector);
            index += sectors + 1;
            index %= sectors;
            var multiple = sector / this.sprite.angle;
            this.sprite.position = Math.floor(index) * multiple;
        } else if (!this.IsNpc) {
            var sitting = this.Effects.Sitting;
            if (sitting) {
                animation = "sit";
                var seat = Entity.get(sitting.SeatId);
                if (seat) {
                    switch (seat.Orientation) {
                    case "w":
                        this.sprite.position = 1; break;
                    case "s":
                        this.sprite.position = 3; break;
                    case "e":
                        this.sprite.position = 5; break;
                    case "n":
                        this.sprite.position = 7; break;
                    }
                }
            } else {
                switch (this.Action.Name) {
                case "attack":
                case "dig":
                    animation = this.Action.Name;
                    break;
                case "defecate":
                case "":
                    break;
                default:
                    animation = "craft";
                }
            }
            var position = this.sprite.position;
            this.sprite = this.sprites[animation];
            this.sprite.position = position;
        }

        if (!this.sprite.ready) {
            this.loadSprite();
            return
        }

        var now = Date.now();
        var speed = (this.Speed && this.Speed.Current || 100);

        if (animation == "run")
            speed *= this.speed;

        if(now - this.sprite.lastUpdate > (this.sprite.speed / speed)) {
            this.sprite.frame++;
            this.sprite.lastUpdate = now;
        }


        if (this.IsNpc) {
            var start = 0, end = 0;
            var current = this.sprite.frames[animation];
            if (Array.isArray(current)) {
                start = current[0];
                end = current[1];
            } else {
                for (var i in this.sprite.frames) {
                    if (animation == i) {
                        end = start + this.sprite.frames[i];
                        break;
                    }
                    start += this.sprite.frames[i];
                }
            }
        } else {
            var start = 0, end = this.sprite.image.width / this.sprite.width;
        }

        if (this.sprite.frame < start || this.sprite.frame >= end) {
            this.sprite.frame = start;
            if (this.Type == "desu")
                this.sprite.lastUpdate = now + util.rand(5, 60) * 60;
        }
    },
    toggleActionSound: function() {
        if (this.action.name)
            game.sound.stopSound(this.action.name);

        this.action.name = this.Action.Name;

        if (!this.Action.Duration)
            return;

        if (this.action.name in game.sound.sounds)
            game.sound.playSound(this.action.name, 0);
    },
    update: function(k) {
        this.animate();
        if (this.Action) {
            if (this.Action.Started != this.action.last) {
                this.action.progress = 0;
                this.action.last = this.Action.Started;
                this.toggleActionSound();
                if (this.isPlayer)
                    util.dom.show(game.controller.iface.actionProgress);
            }
            if(this.Action.Duration) {
                this.action.progress += (Math.PI * 2 / this.Action.Duration * 1000 * k);
            } else {
                if (this.isPlayer)
                    util.dom.hide(game.controller.iface.actionProgress);
                this.action.progress = 0;
            }
        }
        if (this.Mount) {
            if (!this.mount) {
                this.mount = Entity.get(this.Mount);
                if (this.mount)
                    this.mount.rider = this;
            }
            this.Y = this.mount.Y+1;
        } else {
            if (this.mount) {
                this.mount.rider = null;
                this.mount = null;
            }
            this.updatePosition(k);
        }

        if(this.isPlayer) {
            if (this.target && !game.entities.has(this.target.Id))
                this.target = null;

            this.updateBuilding();
            this.updateCamera();
            this.updateBar();
        }

        this.info.map(function(info) {
            info.update(k);
        });

        if (this.ballon) {
            this.ballon.update();
        }

    },
    updateBuilding: function() {
        var n = false, w = false, s = false,  e = false;
        var x = this.X;
        var y = this.Y;

        game.filter("Entity").forEach(function(b) {
            if (b.Group == "wall" || b.Group == "gate") {
                n = n || (b.Y < y && Math.abs(b.X - x) < b.Width);
                w = w || (b.X < x && Math.abs(b.Y - y) < b.Height);
                s = s || (b.Y > y && Math.abs(b.X - x) < b.Width);
                e = e || (b.X > x && Math.abs(b.Y - y) < b.Height);
            }
        });

        this.inBuilding = (n && w && s && e);
    },
    updateBar: function() {
        ["Hp", "Fullness", "Stamina"].map(function(name) {
            var strip = document.getElementById(util.lcfirst(name));
            var param = this[name];
            var value = Math.round(param.Current / param.Max * 100);
            strip.firstChild.style.width = Math.min(100, value) + '%';
            strip.title = name + ": "
                + util.toFixed(this[name].Current) + " / " + util.toFixed(this[name].Max);
            strip.lastChild.style.width = Math.max(0, value - 100) + '%';
        }.bind(this));

        var button = game.controller.iface.actionButton;

        var state = "";
        var tool = Entity.get(this.Equip[Character.equipSlots.indexOf("right-hand")]);
        if (this.burden)
            state = "drop";
        else if (tool)
            state = tool.Type;

        if (button.state == state) {
            return;
        }
        button.onclick = null;
        button.innerHTML = "";
        button.state = state;

        switch (state) {
        case "":
            break;
        case "drop":
            var drop = document.createElement("div");
            drop.textContent = T("Drop");
            button.appendChild(drop);
            button.onclick = function() {
                this.liftStop()
            }.bind(this);
            break;
        default:
            var action = "dig";
            var callback = null;
            switch (tool.Group) {
            case "fishing-rod":
                action = "fish";
                callback = this.fish.bind(this);
            case "shovel":
            case "pickaxe":
                button.appendChild(tool.icon());
                button.onclick = function() {
                    var cursor = new Entity(0, tool.Type);
                    cursor.initSprite();
                    cursor.Sprite.Align = {X: CELL_SIZE, Y: CELL_SIZE};
                    var icon = tool._icon || tool.icon();
                    cursor.Width = CELL_SIZE;
                    cursor.Height = CELL_SIZE;
                    cursor.Sprite.Dx = 6;
                    cursor.Sprite.Dy = 56;
                    cursor.sprite.image = icon;
                    cursor.sprite.width = icon.width;
                    cursor.sprite.height = icon.height;
                    game.controller.creatingCursor(cursor, action, callback);
                };
                break;
            }
        }
    },
    fish: function fish(data) {
        var repeat = fish.bind(this);
        var panel = game.panels["fishing"];
        if (data.Done || data.Ack != "fishing") {
            panel && panel.hide();
            return repeat;
        }

        if (!panel) {
            var rating = document.createElement("div");
            rating.className = "rating";
            var buttons = document.createElement("div");
            var actions = ["IMMA-FIRIN", "MAH-LAZOR" ,"SHOOP-DA-WOOP", "yoro", "grlmrgl", "zap"];
            actions.forEach(function(action, index) {
                var button = document.createElement("button");
                button.textContent = T(action);
                button.move = index;
                button.onclick = function() {
                    panel.hide();
                    game.network.send("fishing-move", {move: this.move}, repeat);
                }
                buttons.appendChild(button);
            });
            panel = new Panel("fishing", "Fishing", [rating, buttons]);
            panel.rating = rating;
        }
        panel.rating.textContent = T(data.Rating)
        panel.show();
        return repeat;
    },
    updateEffect: function(name, effect) {
        var id = "effect-" + name;
        var efdiv = document.getElementById(id);
        var hash = JSON.stringify(effect);
        if (efdiv) {
            if (efdiv.hash == hash)
                return;

            efdiv.innerHTML = "";
            clearInterval(efdiv.interval);
        } else {
            efdiv = document.createElement("div");
            efdiv.id = id;
        }

        efdiv.hash = hash;

        var duration = effect.Duration / 1e6;
        if (duration > 0) {
            var progress = document.createElement("div");
            var last = new Date(duration - (Date.now() - effect.Added*1000));

            progress.className = "effect-progress";
            progress.style.width = "100%";
            efdiv.appendChild(progress);

            var tick = 66;
            efdiv.interval = setInterval(function() {
                last = new Date(last.getTime() - tick);
                var hours = last.getUTCHours();
                var mins = last.getUTCMinutes();
                var secs = last.getUTCSeconds();
                efdiv.title = sprintf("%s: %02d:%02d:%02d\n", T("Duration"), hours, mins, secs);
                progress.style.width = 100 / (duration / last) + "%";
                if (last <= 0) {
                    clearInterval(efdiv.interval);
                }
            }, tick);
        }

        var ename = document.createElement("div");
        ename.className = "effect-name";
        ename.textContent = TS(name);
        if (effect.Stacks > 1)
            ename.textContent += " x" + effect.Stacks;

        efdiv.className  = "effect";
        efdiv.name = name;
        efdiv.appendChild(ename);

        var effects = document.getElementById("effects");
        effects.appendChild(efdiv);
        this.shownEffects[name] = efdiv;
    },
    removeEffect: function(name) {
        util.dom.remove(this.shownEffects[name]);
        delete this.shownEffects[name];
    },
    updateEffects: function() {
        for(var name in this.shownEffects) {
            if (!this.Effects[name]) {
                this.removeEffect(name);
            }
        }

        for (var name in this.Effects) {
            this.updateEffect(name, this.Effects[name]);
        }
    },
    updatePosition: function(k) {
        if (this.Dx == 0 && this.Dy == 0) {
            return;
        }
        k *= this.Speed.Current;
        var x = this.x;
        var y = this.y;
        var dx = this.Dx * k;
        var new_x = x + dx;

        var dy = this.Dy * k;
        var new_y = y + dy;

        var cell = game.map.getCell(new_x, new_y);
        if (cell) {
            if (cell.biom.Blocked) {
                this.stop();
                return;
            }
            this.speed = cell.biom.Speed;
            dx *= this.speed;
            dy *= this.speed;
            new_x = x + dx;
            new_y = y + dy;
        }

        var dst = this.Dst;

        if (Math.abs(dst.X - x) < Math.abs(dx)) {
            new_x = dst.X;
        } else if (new_x < this.Radius) {
            new_x = this.Radius;
        } else if (new_x > game.map.full.width - this.Radius) {
            new_x = game.map.full.width - this.Radius;
        }

        if (Math.abs(dst.Y - y) < Math.abs(dy)) {
            new_y = dst.Y;
        } else if (new_y < this.Radius) {
            new_y = this.Radius;
        } else if (new_y > game.map.full.height - this.Radius) {
            new_y = game.map.full.height - this.Radius;
        }

        if (this.willCollide(new_x, new_y)) {
            this.stop();
            return;
        }

        game.sortedEntities.remove(this);
        this.x = new_x;
        this.y = new_y;
        game.sortedEntities.add(this);

        if (this.x == dst.X && this.y == dst.Y) {
            if (!this.followPath())
                this.stop();
        }

        if (this.rider) {
            this.rider.X = this.x;
            this.rider.Y = this.y+1;
            this.rider.updateBurden();
        }


        if (this.isPlayer) {
            Container.updateVisibility();
            game.controller.craft.updateVisibility();
            game.controller.minimap.update();
        }

        this.updateBurden();
        this.updatePlow();

    },
    followPath: function() {
        if (this.Path && this.Path.length > 0) {
            var p = this.Path.pop();
            this._setDst(p.X, p.Y);
            return true;
        }
        return false;
    },
    updateBurden: function() {
        if (this.burden) {
            this.burden.X = this.X;
            this.burden.Y = this.Y;
        }
    },
    updatePlow: function() {
        if (!this.Effects.Plowing)
            return;
        var plow = Entity.get(this.Effects.Plowing.Plow);
        plow.X = this.X;
        plow.Y = this.Y;
    },
    pickUp: function() {
        var self = this;
        var list = game.findItemsNear(this.X, this.Y).filter(function(e) {
            return e.MoveType == Entity.MT_PORTABLE;
        }).sort(function(a, b) {
            return a.distanceTo(self) - b.distanceTo(self);
        });
        if (list.length > 0)
            list[0].pickUp();
    },
    liftStart: function() {
        var self = this;
        var list = game.findItemsNear(this.X, this.Y).filter(function(e) {
            return e.MoveType == Entity.MT_LIFTABLE;
        }).sort(function(a, b) {
            return a.distanceTo(self) - b.distanceTo(self);
        });
        if (list.length > 0)
            list[0].lift();
    },
    liftStop: function() {
        if (this.burden)
            game.controller.creatingCursor(this.burden.Type, "lift-stop");
    },

    updateCamera: function() {
        var camera = game.camera;
        var screen = game.screen;
        var p = new Point(this.X, this.Y).toScreen();
        camera.x = (p.x - screen.width / 2) << 0;
        camera.y = (p.y - screen.height / 2) << 0;
    },
    willCollide: function(new_x, new_y) {
        return false; //TODO: fix StandUp problems
        return game.entities.some(function(e) {
            return (e instanceof Entity && e.collides(new_x, new_y, this.Radius));
        }.bind(this));
    },
    stop: function() {
        this.Dx = 0;
        this.Dy = 0;
    },
    isNear: function(entity) {
        if (entity.belongsTo(game.player))
            return true;
        if (entity.Width) {
            var padding = this.Radius*2;
            return util.rectIntersects(
                entity.leftTopX() - padding,
                entity.leftTopY() - padding,
                entity.Width + padding * 2,
                entity.Height + padding * 2,
                this.leftTopX(),
                this.leftTopY(),
                this.Width,
                this.Height
            );
        }
        var len_x = entity.X - this.X;
        var len_y = entity.Y - this.Y;
        var r = Math.max(Math.max(entity.Radius, Math.min(entity.Width, entity.Height) / 2), this.Radius);
        return util.distanceLessThan(len_x, len_y, r*2 + 1);
    },
    drawHovered: function() {
        if (this.Invisible)
            return;

        this.sprite.drawOutline(this.getDrawPoint());
        this.drawName(true, true);
    },
    intersects: Entity.prototype.intersects,
    canIntersect: function() {
        return this.sprite.outline != null && (config.ui.allowSelfSelection || this != game.player);
    },
    bag: function() {
        return  Entity.get(this.Equip[0]);
    },
    hasItems: function(items) {
        var found = {};
        var bag = this.bag();
        if (!bag)
            return false;
        var equals = function(items, foundItems) {
            for(var item in items) {
                if (!foundItems || foundItems[item] < items[item])
                    return false;
            }
            return true;
        };

        for(var item in items)
            found[item] = 0;

        for(var i = 0, l = bag.Props.Slots.length; i < l; i++) {
            var eid = bag.Props.Slots[i];
            if (!eid)
                continue;
            var entity = Entity.get(eid);
            if (!entity) {
                game.sendError("hasItems: cannot find %d", eid)
                continue;
            }
            if (items[entity.Group]) {
                found[entity.Group]++;
                if (equals(items, found))
                    return true;
            }
        }
        return false;
    },
    equippedWith: function(group) {
        return this.Equip.filter(function(eid) {
            return (eid != 0);
        }).map(function(eid) {
            return Entity.get(eid);
        }).filter(function(item) {
            return (item.Group == group);
        }).length;
    },
    icon: function() {
        if (!this._icon)
            this._icon = this.sprite.icon();
        return this._icon;
    },
    getParts: function() {
        var parts = [];
        Character.clothes.forEach(function(type, i) {
            if (type == "head" && this.Style && this.Style.HideHelmet)
                return;
            var name = this.Clothes[i];
            if (name && name != "naked")
                parts.push({type: type, name: name});
        }.bind(this));

        if (this.Style && this.Style.Hair) {
            var hairStyle = this.Style.Hair.split("#");
            var hair = {
                type: "hair",
                name: hairStyle[0],
                color: hairStyle[1],
                opacity: hairStyle[2],
            };
            parts.splice(Character.clothesIndex("legs"), 0, hair);
        }
        return parts;
    },
    interact: function() {
        var self = this;
        game.network.send("follow", {Name: this.Name}, function interact(data) {
            if (!data.Done)
                return interact;

            var panel = null;
            var contents = [];
            var info = self.getTalks(); // TODO: omfg rename me
            info.talks.forEach(function(text) {
                var p = document.createElement("p");
                p.textContent = text;
                contents.push(p);
            });

            var buttons = document.createElement("div");
            var actions = document.createElement("ol");
            Object.keys(info.actions).forEach(function(title) {
                var button = document.createElement("button");
                button.textContent = T(title);
                button.onclick = function() {
                    panel.close();
                    Character.npcActions[title].call(self);
                };
                buttons.appendChild(button);

                var li = document.createElement("li");
                li.className = "talk-link";
                li.textContent = info.actions[title];
                li.onclick = button.onclick;

                actions.appendChild(li);
            });
            //TODO: make it less uglier
            if (self.Type == "vendor" && self.Owner == game.player.Id) {
                buttons.appendChild(game.makeSendButton(
                    "Take revenue",
                    "take-revenue",
                    {Vendor: self.Id}
                ));
                buttons.appendChild(game.makeSendButton(
                    "Take sold items",
                    "take-sold-items",
                    {Vendor: self.Id}
                ));
            }

            var wrapper = document.createElement("div");
            wrapper.appendChild(actions);
            wrapper.appendChild(buttons);
            contents.push(wrapper);

            panel = new Panel("talk", self.Name, contents);
            panel.show();
            return null;
        });
    },
    getTalks: function() {
        var type = this.Type;
        // TODO: remove fix after server update
        switch (this.Name) {
        case "Shot":
        case "Bruno":
        case "Boris":
            type = this.Name.toLowerCase();
            break;
        case "Margo":
        case "Umi":
            type = "margo";
            break;
        }
        var sex = ["male", "female"][game.player.Sex];
        var faction = game.player.Citizenship.Faction.toLowerCase();
        return game.talks.get(type, faction, sex);
    },
    isInteractive: function() {
        switch (this.Name) {
        case "Shot":
        case "Margo":
        case "Umi":
        case "Bruno":
        case "Boris":
            return true;
        }
        switch (this.Type) {
        case "charles":
        case "vendor":
            return true;
        }
        return false;
    },
    canUse: function(e) {
        switch (e.Location) {
        case Entity.LOCATION_IN_CONTAINER:
            var cnt = e.findRootContainer();
            return cnt && this.canUse(cnt);
        case Entity.LOCATION_EQUIPPED:
            return this.Id == e.Owner;
        default:
            return this.isNear(e);
        }
    },
    drawAnimation: function(anims) {
        var animation = {};
        for (var type in anims) {
            var anim = anims[type];
            var sprt = new Sprite(
                "animations/" + anim.name + "-" + type + ".png",
                anim.width,
                anim.height,
                80
            );
            if (anim.dy)
                sprt.dy = anim.dy;
            animation[type] = sprt;
        }

        loader.ready(function() {
            this.animation = animation;
        }.bind(this));
    }
};
