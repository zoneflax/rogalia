function Entity(id, type) {
    var e = this;
    if (type) {
        e = Object.create(Entity.templates[type]);
    }
    e.Id = id || 0;
    e.Type = type || "";
    if (id)
        e.sprite = {};
    return e;
}

Entity.prototype = {
    Id: 0,
    Name: "",
    Width: 0,
    Height: 0,
    Radius: 0,
    Type: "",
    Group: "",
    Lvl: 1,
    Container: -1,
    Quality: 1,
    Disposition: 0,
    MoveType: Entity.MT_PORTABLE,
    Creator: 0,
    Owner: 0,
    Sprite: null,
    State: "",
    Variant: "",
    Orientation: "",
    Recipe: null,
    Props: null,
    CanCollide: true,
    Actions: null,
    Durability: null,
    sprite: null,
    _canUse: false,
    _icon: null,
    _path: "",
    x: 0,
    y: 0,
    get X() {
        return this.x;
    },
    get Y() {
        return this.y;
    },
    set X(x) {
        if (this.x == x)
            return;
        if (this.Id && this.Container < 0)
            game.sortedEntities.remove(this);
        this.x = x;
        if (this.Id && this.Container < 0)
            game.sortedEntities.add(this, this.sortOrder());
    },
    set Y(y) {
        if (this.y == y)
            return;
        if (this.Id && this.Container < 0)
            game.sortedEntities.remove(this);
        this.y = y;
        if (this.Id && this.Container < 0)
            game.sortedEntities.add(this);
    },
    get name() {
        var name = TS(this.Name);
        if (this.Props.Capacity) {
            name += ' [' +
                util.toFixed(this.Props.Capacity.Current) +
                '/' +
                util.toFixed(this.Props.Capacity.Max) +
                ']'
        }
        if (this.Props.Text) {
            var title = Entity.books[this.Props.Text];
            if (title)
                name += ": " + title;
        }

        if (!("Amount" in this))
            name += "\n" + T("Quality") + ": " + this.Quality;

        return name;
    },
    set name(value) {
        //ignore
    },
    get title() {
        var title = this.Type;
        var suffix = "";
        switch (this.Group) {
        case "blank":
            title = this.Props.Type;
            break;
        case "liquid-container-liftable":
        case "tanning-tub":
            var cap = this.Props.Capacity
            suffix = sprintf("[%d/%d]", cap.Current,  cap.Max);
            break;
        default:
            if (this.Name)
                title = this.Name;
        }

        if (this.Type.contains("-corpse") || this.Type == "head")
            return T(title);

        return TS(title) + suffix;
    },
    get point() {
        return new Point(this.X, this.Y);
    },
    get round() {
        return this.Width > 0;
    },
    showInfo: function() {
        var elements = [];

        elements.push(Stats.prototype.createValue("Quality", this.Quality));
        elements.push(Stats.prototype.createParam("Durability", this.Durability));

        if (this.Group == "food") {
            elements.push(util.hr());
            var k = Math.sqrt(this.Quality);
            for (var i in this.Props) {
                var v = this.Props[i];
                if (i != "Energy")
                    v *= k;
                elements.push(Stats.prototype.createValue(i, v, 2));
            }
        } else if ("Damage" in this) {
            elements.push(Stats.prototype.createValue("Damage", this.Damage));
        } else if (this.Props.Capacity) {
            elements.push(Stats.prototype.createParam("Capacity", this.Props.Capacity));
        }

        var panel = new Panel("item-info", TS(this.Name), elements);
        panel.show();
    },
    leftTopX: function() {
        return (this.X - this.Width / 2) << 0;
    },
    leftTopY: function() {
        return (this.Y - this.Height / 2) << 0;
    },
    screen: function() {
        return this.point.toScreen();
    },
    getDrawDx: function() {
        return this.Sprite.Dx || this.sprite.width/2;
    },
    getDrawDy: function() {
        if (this.Sprite.Dy)
            return this.Sprite.Dy;

        var r = (this.round) ? this.sprite.width/4 : this.Radius;
        return this.sprite.height - r;
    },
    getDrawPoint: function() {
        var p = new Point(this.X, this.Y).toScreen();
        p.x -= this.getDrawDx();
        p.y -= this.getDrawDy();
        return p.round();
    },
    sortOrder: function() {
        var y = this.Y + this.X;

        switch (this.Disposition) {
        case "roof":
            y += game.map.full.height;
            break;
        case "floor":
            y -= game.map.full.height;
        }
        return y;
    },
    initSprite: function() {
        var path = (this.Sprite.Name)
            ? this.Sprite.Name
            : this.Type;

        if (this.Props.LiquidType) {
            path += "-" + this.Props.LiquidType;
        }

        switch (this.Type) {
        case "wooden-table":
        case "bookshelf":
        case "wooden-trough":
        case "stack-of-wood":
            if (!this.Props.Slots)
                break;
            if (this.Props.Slots.some(function(id){ return id != 0 }))
                path += "-full";
        }

        if (this.Type != "blank") {
            if (this.State) {
                path += "-" + this.State;
            }

            if (this.Orientation) {
                path += "-" + this.Orientation
            }

            if (this.Variant) {
                path += "-" + this.Variant;
            }
        }

        if (!path) {
            game.error("Entity %o has no sprite", this);
        }
        if (this.sprite && this.sprite.ready && path == this._path) {
            return;
        }
        this._path = path;


        this.sprite = new Sprite(
            path + ".png",
            this.Sprite.Width,
            this.Sprite.Height,
            this.Sprite.Speed
        );

        //TODO: removeme
        if (this.Group == "shovel") {
            this._icon = loader.loadImage(this.Type + "-icon.png");
        }
    },
    add: function() {
        game.controller.creatingCursor(this.Type);
    },
    is: function(type) {
        if (this.Type == type || this.Group == type) {
            return true;
        }
        var meta = Entity.metaGroups[type] || [];
        return meta.some(function(kind) {
            return this.is(kind);
        }.bind(this));
    },
    getActions: function() {
        var actions = [{}, {}, {}];

        if (this.MoveType == Entity.MT_PORTABLE && !this.inContainer())
            actions[0]["Pick up"] = this.pickUp;
        else if (this.MoveType == Entity.MT_LIFTABLE)
            actions["Lift"] = this.lift;

        for(var i = 0, l = this.Actions.length; i < l; i++) {
            actions[1][this.Actions[i]] =  this.actionApply(this.Actions[i]);
        }

        if (this.Orientation != "" && this.MoveType != Entity.MT_STATIC) {
            actions[0]["Rotate"] = function() {
                game.network.send("rotate", {id: this.Id});
            }
        }
        // if (this.MoveType != Entity.MT_STATIC && game.player.IsAdmin)
        //     actions[2]["Fix"] = this.fix;
        actions[2]["Destroy"] =  this.destroy;
        actions[2]["Info"] = this.showInfo;
        return actions;
    },
    alignedData: function(p) {
        var align = this.Sprite && this.Sprite.Align;
        if (align && align.X) {
            var w = this.Width || 2*this.Radius;
            var h = this.Height || 2*this.Radius;
            p.x -= w/2;
            p.y -= h/2;
            p.align(new Point(align));
            return {
                x: p.x,
                y: p.y,
                w: Math.max(w, align.X),
                h: Math.max(h, align.Y),
            };
        }
        return null;
    },
    defaultActionSuccess: function() {
    },
    defaultAction: function() {
        game.network.send("entity-use", { id: this.Id }, function done(data) {
            if (data.Done)
                this.defaultActionSuccess();
            else
                return done.bind(this);
        }.bind(this));
    },
    destroy: function() {
        game.network.send("entity-destroy", {id: this.Id});
    },
    fix: function() {
        game.network.send("entity-fix", {id: this.Id});
    },
    pickUp: function() {
        game.network.send("entity-pick-up", {id: this.Id})
    },
    lift: function() {
        game.network.send("lift-start", {id: this.Id}, function() {
            game.help.runHook({type: "lift"});
        });
    },
    SetRespawn: function() {
        if (confirm(T("Are you sure?"))) {
            game.network.send("SetRespawn", {id: this.Id});
        }
    },
    actionApply: function(action) {
        var localAction = util.lcfirst(action);
        return function() {
            if (this[localAction]) {
                this[localAction]();
                return;
            }

            game.help.actionHook(action);
            game.network.send(action, {
                id: this.Id
            });
        };
    },
    inContainer: function() {
        return this.Container >= 0;
    },


    update: function() {
    },

    //used by sign
    read: function() {
        var text = document.createElement("textarea");
        text.readonly = true;
        if (this.Props.Text[0] == "$") {
            util.ajax("books/ru/" + this.Props.Text.substr(1) + ".txt", function(data) {
                text.value = data;
            }.bind(this));
        } else {
            text.value = this.Props.Text;
        }
        var p = new Panel("editable", this.Name, [text]);
        p.show();
    },
    //used by sign
    edit: function() {
        if (this.Props.Text && !game.player.IsAdmin)
            return;
        var text = prompt("Edit message", this.Props.Text);
        if (text) {
            game.network.send("sign-edit", {Id: this.Id, Text: text});
        }
    },
    //used by container
    open: function(data) {
        if (data && !data.Done)
            return this.open.bind(this);

        if (!game.player.isNear(this)) {
            game.network.send("Open", {Id: this.Id}, this.open.bind(this))
            return;
        }
        var container = Container.open(this.Id);
        container.panel.show();
    },
    disassemble: function() {
        game.network.send("disassemble", {Id: this.Id});
    },

    split: function() {
        var args = {Id: this.Id}
        if (this.Group == "currency") {
            var amount = prompt("How many?", 1);
            if (!amount)
                return;
            args.Amount = +amount
            game.network.send("split", args);
        } else {
            game.network.send("Split", args);
        }
    },

    bugreport: function() {
        window.open("http://rogalik.tatrix.org/forum/posting.php?mode=reply&f=2&t=11", "_blank");
    },

    sync: function(data) {
        for(var prop in data) {
            this[prop] = data[prop];
        }

        switch(this.Group) {
        case "portal":
        case "book":
        case "grave":
        case "sign":
            this.Actions.push("edit");
            this.Actions.push("read");
            break;
        case "processor":
        case "bonfire":
        case "furnace":
        case "oven":
            this._canUse = true;
        case "fishing-rod":
        case "table":
        case "bag":
        case "drying-frame":
        case "garbage":
        case "container":
            if (this.MoveType != Entity.MT_PORTABLE)
                this.defaultActionSuccess = this.open.bind(this);
            if (this.Type == "altar")
                this.Actions.push("bugreport");
            break;
        case "blank":
            this.defaultActionSuccess = function() {
                game.controller.craft.open(this, game.player.Burden);
            }.bind(this);
            break;
        case "currency":
            if (this.Amount)
                this.Name = this.Amount + " " + this.Name;
            break;
        case "tanning-tub":
            this._canUse = true;
            break;
        }

        if (this.Creator && this.MoveType != Entity.MT_STATIC)
            this.Actions.push("disassemble");

        if ("Amount" in this && this.Amount > 1)
            this.Actions.push("split");
    },
    autoHideable: function() {
        if (this.Height <= 8 || this.Width <= 8)
            return false;
        return this.Sprite.Unselectable && this.Disposition != "floor";
    },
    almostBroken: function() {
        return this.Durability.Max > 0 && this.Durability.Current <= 0.1*this.Durability.Max;
    },
    draw: function() {
        if (this.inContainer())
            return;
        if (game.player.inBuilding && this.Disposition == "roof")
            return;
        // if (!game.player.see(this))
        //     return;

        if (!this.sprite || !this.sprite.ready) {
            this.drawBox();
            return;
        }

        this.sprite.animate();

        var p = this.getDrawPoint();
        if (this.Id && this.Id == game.player.Burden) {
            p.y -= game.player.sprite.height/2;
        }
        if ((this.MoveType == Entity.MT_STATIC ||
            this.CanCollide) &&
            game.controller.hideStatic()) {
            this.drawBox();
        } else if (game.player.inBuilding &&
                   (this.Y + this.X > game.player.Y + game.player.X) &&
                   this.autoHideable())
        {
            var color = "";
            if (this.Group == "gate") {
                color = (this.CanCollide) ? "violet" : "magenta";
            }
            this.drawBox(color);
        } else {
            if (this.Type == "blank") {
                game.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                if (this.round) {
                    game.iso.fillRect(this.leftTopX(), this.leftTopY(), this.Width, this.Height);
                } else {
                    game.iso.fillCircle(this.X, this.Y, this.Radius);
                }
            }
            this.sprite.draw(p)
        }

        if (this.Creator && this.almostBroken()) {
            this.drawBox("red");
        }

        if (game.debug.entity.box) {
            this.drawBox();
        }


        if(game.debug.entity.position) {
            var text = "(" + (this.X) + " " + (this.Y) + ")";
            text += " id:" + this.Id
            game.ctx.fillStyle = "#fff";
            game.drawStrokedText(text, p.x, p.y);
        }
    },
    drawClaim: function() {
        var w = (this.West+this.East)*CELL_SIZE;
        var h = (this.North+this.South)*CELL_SIZE;
        var x = this.X - w/2;
        var y = this.Y - h/2;
        var color = (game.player.Id == this.Creator) ? "255,255,255" : "255,0,0";
        if (config.ui.fillClaim) {
            game.ctx.fillStyle = "rgba(" + color + ", 0.3)";
            game.iso.fillRect(x, y, w, h);
        }
        if (config.ui.strokeClaim) {
            game.ctx.lineWidth = 3;
            game.ctx.strokeStyle = "rgba(" + color + ", 0.7)";
            game.iso.strokeRect(x, y, w, h);
            game.ctx.lineWidth = 1;
        }
    },
    drawUI: function() {
        //TODO: write
    },
    drawBox: function(color) {
        game.ctx.strokeStyle = color || "cyan";

        var p = this.screen();
        if (this.round) {
            game.iso.strokeRect(this.leftTopX(), this.leftTopY(), this.Width, this.Height);
        } else {
            game.iso.strokeCircle(this.X, this.Y, this.Radius)
        }

        game.ctx.fillStyle = "magenta";
        game.ctx.fillRect(p.x, p.y, 3, 3);
    },
    setPoint: function(p) {
        this.X = p.x;
        this.Y = p.y;
    },
    drawHovered: function() {
        this.sprite.drawOutline(this.getDrawPoint());
        var p = this.screen();
        var x = p.x - game.ctx.measureText(this.title).width / 2;
        var y = p.y - (this.sprite.height - this.Radius) - FONT_SIZE;

        switch (this.Group) {
        case "sign":
        case "grave":
            if (!this.Props.Text)
                break;
            var text = this.Props.Text;
            var padding = 5;
            var measure = game.ctx.measureText(text);
            x = p.x - measure.width / 2;
            y -= FONT_SIZE;
            game.ctx.fillStyle = "#444";
            game.ctx.fillRect(
                x,
                y,
                measure.width + padding * 2,
                FONT_SIZE + padding * 2
            );
            game.ctx.fillStyle = "#fff";
            game.ctx.fillText(text, x + padding, y + padding + FONT_SIZE);
            return;
        }
        game.ctx.fillStyle = "#fff";
        var title = this.title;
        if (game.controller.modifier.shift)
            title += " | " + T("Quality") + ":" + this.Quality;
        game.drawStrokedText(title, x, y);
    },
    canIntersect: function(noignore) {
        switch (this.Group) {
        case "respawn":
            return true;
        }
        if (this.inContainer())
            return false;
        if (this.Id == game.player.Burden)
            return false;
        if (!this.sprite.outline)
            return false;
        if (this.MoveType == Entity.MT_STATIC && game.controller.hideStatic())
            return false;


        if (game.player.inBuilding) {
            if (this.Disposition == "roof")
                return false;
            if (this.autoHideable() && this.Group != "gate")
                return false;
        }

        noignore = noignore || game.controller.modifier.ctrl

        if (config.cursor.autoHighlightDoors && this.Group == "gate")
            return true;

        return noignore || (!this.Sprite.Unselectable && !this.Disposition);
    },
    //used for controller.hovered
    intersects: function(x, y, noignore) {
        if (!this.canIntersect(noignore))
            return false;
        if (!this.sprite.imageData)
            return false;

        var w = this.sprite.width;
        var h = this.sprite.height;
        var offset = new Point(
            w * this.sprite.frame,
            h * this.sprite.position
        );
        var p = new Point(x, y)
            .toScreen()
            .sub(this.getDrawPoint())
            .add(offset);

        if (!util.intersects(
            p.x, p.y,
            offset.x, offset.y, w, h
        )) {
            return false
        }

        var pixel = this.sprite.imageData.data[p.y*4*this.sprite.imageData.width + p.x*4-1];
        return pixel > 64;
    },
    collides: function(x, y, radius) {
        if(this.inContainer() || !this.CanCollide || this.Owner)
            return false;
        if (this.Width && this.Height) {
            //TODO: fixme
            return util.rectIntersects(
                this.leftTopX(),
                this.leftTopY(),
                this.Width,
                this.Height,
                x - radius,
                y - radius,
                radius,
                radius
            );
        }
        return util.distanceLessThan(this.X - x, this.Y - y, Math.max(this.Radius, radius));
    },
    distanceTo: function(e) {
        return Math.hypot(this.X - e.X, this.Y - e.Y);
    },
    drop: function() {
        game.network.send("entity-drop", {id: this.Id});
    },
    use: function(e) {
        game.network.send("entity-use", {Id: e.Id, Equipment: this.Id})
        return true;
    },
    canUse: function(e) {
        return this._canUse;
    },
    belongsTo: function(character) {
        if (this.Container == 0)
            return true;
        var id = this.Container;
        var bag = character.bag();
        if (!bag)
            return false;
        while (id > 0) {
            if (id == bag.Id)
                return true;
            var e = Entity.get(id);
            if (!e)
                return false;
            id = e.Container;
        }
        return false;
    },
    icon: function() {
        if (this._icon)
            return this._icon.cloneNode();
        if (!this.sprite)
            this.initSprite();
        return this.sprite.icon();
    },
    rotate: function(delta) {
        switch (this.Orientation) {
        case "v":
            this.Orientation = "h";
            break;
        case "h":
            this.Orientation = "v";
            break;
        case "n":
        case "w":
        case "s":
        case "e":
            if (delta < 0) {
                switch(this.Orientation) {
                case "n":
                    this.Orientation = "w";
                    break;
                case "w":
                    this.Orientation = "s";
                    break;
                case "s":
                    this.Orientation = "e";
                    break;
                case "e":
                    this.Orientation = "n";
                    break;
                default:
                    return;
                }
            } else {
                switch(this.Orientation) {
                case "n":
                    this.Orientation = "e";
                    break;
                case "e":
                    this.Orientation = "s";
                    break;
                case "s":
                    this.Orientation = "w";
                    break;
                case "w":
                    this.Orientation = "n";
                    break;
                default:
                    return;
                }
            }
            break;
        default:
            return
        }

        this.sprite.ready = false;

        var w = this.Width;
        this.Width = this.Height;
        this.Height = w;

        this.initSprite();
        game.controller.lastCreatingRotation++;
    }
};
