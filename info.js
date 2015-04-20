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
            console.trace(container, item)
        else
            slot.classList.add("new");
        break;
    case "build-open":
        var blank = Entity.get(this.data);
        game.controller.craft.open(blank);
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
    draw: function() {
        var target = null;
        if (this.data && this.data.To) {
            target = game.characters.get(this.data.To);
            //on teleport/death can be empty
            if (!target)
                return;
        } else {
            target = game.player;
        }
        var p = target.screen();
        p.y -= target.sprite.nameOffset + 2*FONT_SIZE;

        switch(this.type) {
        case "heal":
            this.drawValue(p, "#0c0", "+" + this.value + "hp");
            break;
        case "exp-gain":
            this.drawValue(p, "#ff0", "+" + this.value + "xp");
            break;
        case "damage-deal": {
            this.drawValue(p, "#0ff", null, target);
            break;
        }
        case "damage-gain":
            this.drawValue(p, "#f00", null, target);
            break;
        }
    },
    drawValue: function(p, color, text, target) {
        //TODO: omfg
        if (target && this.damageTexture && this.frame * 64 < this.damageTexture.width) {
            game.ctx.drawImage(
                this.damageTexture,
                64 * this.frame++,
                0,
                64,
                63,
                Math.round(p.x - 32),
                Math.round(p.y - ((target.Type == "human") ? 64 : 32)),
                64,
                63
            );
        }
        text = text || this.value.toFixed(2);
        p.x = p.x + this.x - game.ctx.measureText(text).width / 2;

        game.ctx.fillStyle = color;
        game.drawStrokedText(text, p.x, p.y + this.y);
    },
}
