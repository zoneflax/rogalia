//TODO: get rid of switches
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
        if (character.isPlayer)
            this.text = T("Lvl up") + ": " + character.Lvl + "!";
        break;
    case "miss":
        if (character == game.player)
            this.text = T("You missed");
        else
            this.text = "Evade from " + this.data + " attack"; //TODO: use ~T.printf
        break;
    case "damage":
        if (this.data instanceof Object) {
            console.log("IN");
            this.value = this.data.Dmg;
            if (this.target == game.player)
                this.text = this.character.Name + " " + this.data.Action + "ed you in the " + this.data.Target;
            else
                this.text = "You " + this.data.Action + "ed " + this.data.To + " in the " + this.data.Target;
        } else {
            this.value = this.data;
        }
        break;
    case "exp-gain":
        this.value = this.data;
        game.sound.playSound("xp");
        if (this.target == game.player)
            this.text = "You've got " + this.value + " xp and LP";
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
        }
        game.sound.playSound("heal");
        break;
    case "item-gain":
    case "craft-success":
        game.controller.highlight("inventory");
        var item = Entity.get(this.data);
        if (!item) {
            game.sendErrorf("(Info.js) Cannot find item %d", this.data);
            return
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
    case "combo":
        this.text = this.data;
    }
    this.value = util.toFixed(this.value, 2);

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
    this.frame = 0;
};

Info.prototype = {
    damageTexture: null,
    update: function(k) {
        if (this.time + this.duration < Date.now()) {
            this.character.info.splice(this.character.info.indexOf(this), 1);
            return;
        }
        switch(this.type) {
        case "text":
            break;
        default:
            this.y -= 10 * k;
        }
    },
    draw: function() {
        if (!this.target) //on teleport/death can be empty
            return;

        switch(this.type) {
        case "heal":
            this.drawValue("#0c0", "+" + this.value + "hp");
            break;
        case "exp-gain":
            this.drawValue("#ff0", "+" + this.value + "xp");
            break;
        case "miss":
            this.drawValue("#ccc", "miss");
            break;
        case "damage":
            this.drawValue("#f00", null);
            break;
        case "combo":
            game.ctx.save();
            game.setFontSize(50);
            this.drawValue("#fff", this.text);
            game.ctx.restore();
        }
    },
    drawValue: function(color, text) {
        var p = this.target.screen();
        p.y -= this.target.sprite.nameOffset + 2*FONT_SIZE;

        if (this.data.To) //TODO: fix creepy condition
            this.drawDamage(p);

        text = text || this.value;
        p.x = p.x + this.x - game.ctx.measureText(text).width / 2;

        game.ctx.fillStyle = color;
        game.drawStrokedText(text, p.x, p.y + this.y);
    },
    drawDamage: function(p) {
        //TODO: omfg
        if (this.damageTexture && this.frame * 64 < this.damageTexture.width) {
            game.ctx.drawImage(
                this.damageTexture,
                64 * this.frame++,
                0,
                64,
                63,
                Math.round(p.x - 32),
                Math.round(p.y - ((this.target.Type == "human") ? 64 : 32)),
                64,
                63
            );
        }
    },
    getTarget: function() {
        switch (this.type) {
        case "damage":
            if (this.data && this.data.To) {
                return game.characters.get(this.data.To);
            }
            break;
        case "miss":
            return game.characters.get(this.data);
        }
        return this.character;
    },
};
