"use strict";
function Info(message, character) {
    this.data = message.Data;
    this.character = character;
    this.text = message.Text;
    this.type = message.Type;
    this.time = Date.now();
    this.x = 0;
    this.y = 0;
    this.duration = 2500;
    this.value = null;

    this.target = this.getTarget();
    this.targetType = "other";

    if (this.target == game.player)
        this.targetType = "self";
    else if (this.character == game.player)
        this.targetType = "target";

    if (game.help)
        game.help.runHook(this);

    switch(this.type) {
    case "lvl-up":
        this.character.drawAnimation({
            up: {
                name: "lvl-up",
                width: 100,
                height: 220,
            },
            down: {
                name: "lvl-up",
                width: 100,
                height: 60,
            }
        });
        game.sound.playSound("lvl-up");
        break;
    case "attack":
        this.target.drawAnimation({
            up: {
                name: "damage",
                width: 64,
                height: 63,
                dy: -this.target.sprite.height/2,
            },
        });
        if (this.target.IsNpc)
            game.sound.playSound("hit");
        else
            game.sound.playSound("punch");
    case "damage":
        this.value = this.data.Value;
        break;
    case "combo":
        this.text = this.data.Combo;
        this.x = 30;
        break;
    case "exp-gain":
        this.value = this.data;
        break;
    case "heal":
        this.value = this.data;
        if (this.value > this.character.Hp.Max/10) {
            this.character.drawAnimation({
                up: {
                    name: "heal",
                    width: 96,
                    height: 128,
                    dy: -8
                },
                down: {
                    name: "heal",
                    width: 96,
                    height: 128,
                    dy: -8
                }
            });
            game.sound.playSound("heal");
        }
        break;
    case "item-gain":
    case "craft-success":
        game.controller.highlight("inventory");
        var item = Entity.get(this.data);
        if (!item) {
            game.sendErrorf("(Info.js) Cannot find item %d", this.data);
            return;
        }
        // it's possible when we replace item e.g. in onCraft
        var container = game.containers[item.Container];
        if (!container) {
            game.sendErrorf("(Info.js) Cannot find container %d for item %d", item.Container, item.Id);
            return;
        }
        container.reload();
        var slot = container.slots[container.contents.indexOf(item.Id)];
        if (!slot)
            console.trace(container, item);
        else
            slot.classList.add("new");
        break;
    case "build-open":
        var blank = Entity.get(this.data);
        game.controller.craft.open(blank);
        return;
    }
    this.value = util.toFixed(this.value, (this.value < 1) ? 2 : 0);

    var formatter = this.formatters[this.type];
    if (formatter)
        this.text = formatter.call(this);

    if (!this.text)
        return;


    if (game.chat)
        game.chat.addMessage(this.text);
    else
        console.warn(this.text, "Chat is null");

    if (!this.data) {
        var record = document.createElement("div");
        record.textContent = this.text;
        document.getElementById("messages").appendChild(record);
        setTimeout(function() {
            record.parentNode.removeChild(record);
        }, this.duration);
    }
};

Info.prototype = {
    update: function(k) {
        if (this.time + this.duration < Date.now()) {
            this.character.info.splice(this.character.info.indexOf(this), 1);
            return;
        }
        switch(this.type) {
        case "text":
            break;
        default:
            this.y -= 20 * k;
        }
    },
    draw: function() {
        if (!this.target) //on teleport/death can be empty
            return;

        var big = 20;
        var huge = 50;
        switch(this.type) {
        case "heal":
            this.drawValue(
                "+" + this.value + "hp",
                {
                    self: ["#0c0", big],
                    target: ["#0f0", big],
                    other: ["#0c0"],
                }
            );
            break;
        case "exp-gain":
            this.drawValue(
                "+" + this.value + "xp",
                {
                    self: ["#ff0", big],
                    other: ["#ff0"],
                }
            );
            break;
        case "miss":
        case "block":
            this.drawValue(
                this.type,
                {
                    self: ["#aaf", big],
                    target: ["#fff", big],
                    other: ["#ccc"],
                }
            );
            break;
        case "damage":
            this.drawValue(
                this.value,
                {
                    self: ["#c33"],
                    target: ["#aac"],
                    other: ["#eee"],
                }
            );
            break;
        case "attack":
            this.drawValue(
                this.value,
                {
                    self: ["#f33", big],
                    target: ["#aaf", big],
                    other: ["#ccc"],
                }
            );
            break;
        case "combo":
            this.drawValue(
                this.text,
                {
                    self: ["#f33", big],
                    target: ["#aaf", huge],
                    other: ["#ccc"],
                }
            );
            break;
        }
    },
    drawValue: function(text, config) {
        var target = this.target;

        config = config[this.targetType];

        var color = config[0] || "#f00";
        var size = config[1];

        game.ctx.fillStyle = color;

        var p = target.screen();
        p.y -= target.sprite.nameOffset + 2*FONT_SIZE;
        p.x += this.x - game.ctx.measureText(text).width / 2;

        if (size) {
            game.setFontSize(size);
            p.x += size;
        }


        game.drawStrokedText(text, p.x, p.y + this.y);

        if (size)
            game.setFontSize();
    },
    getTarget: function() {
        switch (this.type) {
        case "murder":
        case "miss":
        case "block":
            return game.characters.get(this.data);
        case "combo":
        case "attack":
            return game.characters.get(this.data.Target);
        }
        return this.character;
    },
    formatters: {
        "lvl-up": function() {
            switch (this.targetType) {
            case "self":
                return  T("Lvl up") + ": " + this.character.Lvl + "!";
            default:
                return TT("{name} got a new lvl", {name: this.character.Name});
            }
        },
        "exp-gain": function() {
            switch (this.targetType) {
            case "self":
                return TT("You've got {value} XP and LP", {value: this.value});
            default:
                return TT("{name} got {value} XP and LP", {
                    name: this.character.Name,
                    value: this.value,
                });
            }
        },
        "miss": function() {
            switch (this.targetType) {
            case "self":
                return TT("You evaded from {name}'s attack", {name: this.character.Name});
            case "target":
                return TT("{name} evaded from your attack", {name: this.target.Name});
            default:
                return TT(
                    "{who} evaded from {which}'s attack",
                    {who: this.target.Name, which: this.character.Name}
                );
            }
        },
        "block": function() {
            switch (this.targetType) {
            case "self":
                return TT("Blocked {name}'s attack", {name: this.character.Name});
            case "target":
                return TT("{name} blocked your attack", {name: this.target.Name});
            default:
                return TT(
                    "{who} blocked {which}'s attack",
                    {who: this.target.Name, which: this.character.Name}
                );
            }
        },
        "murder": function() {
            switch (this.targetType) {
            case "self":
                return TT("{name} killed you", {name: this.character.Name});
            case "target":
                return TT("You killed {name}", {name: this.target.Name});
            default:
                return TT(
                    "{who} killed {whom}",
                    {who: this.target.Name, whom: this.character.Name}
                );
            }
        },
        "damage": function () {
            switch (this.targetType) {
            case "self":
                return TT("You've got {value} damage from {source}", {
                    value: this.value,
                    source: this.data.Source,
                });
            default:
                return TT("{name} got {value} damage from {source}", {
                    value: this.character.Name,
                    source: this.data.Source,
                });
            }
        },
        "attack": function() {
            switch (this.targetType) {
            case "self":
                return TT("{name} did {value} damage to you with {attack}", {
                    name: this.character.Name,
                    value: this.value,
                    attack: this.data.Attack,
                });
            case "target":
                return TT("You did {value} damage to {name} with {attack}", {
                    name: this.target.Name,
                    value: this.value,
                    attack: this.data.Attack,
                });
            default:
                return TT(
                    "{who} did {value} damage to {whom} with {attack}", {
                        who: this.character.Name,
                        value: this.value,
                        whom: this.target.Name,
                        attack: this.data.Attack,
                    }
                );
            }
        },
    }
};
