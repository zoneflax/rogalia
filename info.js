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

    if (game.help)
        game.help.runHook(this);


    switch(this.type) {
    case "damage-gain":
        this.value = -this.data;
        break;
    case "damage-deal":
        this.value = this.data.Dmg;
        break;
    case "heal":
    case "exp-gain":
        this.value = this.data;
        break;
    case "item-gain":
    case "craft-success":
        game.controller.highlight("inventory");
        var item = Entity.get(this.data);
        if (!item) {
            game.sendError("(Info.js) Cannot find item %d", this.data);
            return
        }
        // it's possible when we replace item e.g. in onCraft
        var container = game.containers[item.Container];
        if (!container) {
            game.sendError("(Info.js) Cannot find container %d for item %d", item.Container, item.Id);
            return;
        }
        container.reload();
        var slot = container.slots[container.contents.indexOf(item.Id)];
        if (!slot)
            console.trace(container, item)
        slot.classList.add("new");
        break;
    case "build-open":
        var blank = Entity.get(this.data);
        game.controller.build.open(blank);
        return;
    }

    if (!this.text)
        return;

    if (game.chat)
        game.chat.addMessage(this.text);
    else
        console.warn(this.text, "Chat is null")

    if (!this.data) {
        var record = document.createElement("div");
        record.textContent = this.text;
        document.getElementById("messages").appendChild(record);
        setTimeout(function() {
            record.parentNode.removeChild(record);
        }, this.duration);
    }

    //TODO: cache
    this.damageTexture = game.loader.loadImage("damage.png");
    this.frame = 0;
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
            this.y -= 10 * k;
        }
    },
    draw: function(x, y) {
        switch(this.type) {
        case "heal":
            this.drawValue(x, y, "#0c0", "+" + this.value + "hp");
            break;
        case "exp-gain":
            this.drawValue(x, y, "#ff0", "+" + this.value + "xp");
            break;
        case "damage-deal": {
            //TODO: fixme
            var character = game.characters[this.data.To]; //on teleport/death can be empty
            if (character) {
                var p = character.screen();
                this.drawValue(p.x, p.y - (CELL_SIZE + FONT_SIZE), "#0ff", null, character);
            }
            break;
        }
        case "damage-gain":
            this.drawValue(x, y, "#f00", null, game.player);
            break;
        }
    },
    drawValue: function(x, y, color, text, target) {
        //TODO: omfg
        if (target && this.damageTexture && this.frame * 64 < this.damageTexture.width) {
            game.ctx.drawImage(
                this.damageTexture,
                64 * this.frame++,
                0,
                64,
                63,
                Math.round(x - 32),
                Math.round(y - ((target.Type == "human") ? 64 : 32)),
                64,
                63
            );
        }
        text = text || this.value.toFixed(2);
        x = x + this.x - game.ctx.measureText(text).width / 2;

        game.ctx.fillStyle = color;
        game.drawStrokedText(text, x, y + this.y);
    },
}
