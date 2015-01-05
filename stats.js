function Stats() {
    this.equipContainer = Container.open(0);
    this.update();

    this.toggleStats = document.createElement("button");
    this.toggleStats.textContent = T("Stats");
    this.toggleStats.onclick = function() {
        util.dom.toggle(this.social);
        util.dom.toggle(this.statistics);
    }.bind(this);

    this.social.classList.add("hidden");
    this.statistics.classList.add("hidden");

    this.panel = new Panel(
        "stats",
        "Stats",
        [
            this.summary,
            this.doll,
            this.equip,
            util.hr(),
            this.vital,
            util.hr(),
            this.main,
            util.hr(),
            this.params,
            util.hr(),
            this.exp,
            util.hr(),
            this.social,
            this.statistics,
            this.toggleStats,
        ],
        {
            mousedown: this.equipContainer.clickListener.bind(this.equipContainer),
        }
    );
}
Stats.update = function() {
    var button = document.getElementById("stats-button");
    button.innerHTML = "";
    var icon = game.player.icon();
    var canvas = icon.cloneNode();
    canvas.getContext("2d").drawImage(icon, 0, 0);

    button.appendChild(canvas);
};

Stats.prototype = {
    createParam: function(label, param, digits) {
        var value = document.createElement("span");
        digits = digits || 0;

        value.textContent = util.toFixed(param.Current, digits) +
            ' / ' + util.toFixed(param.Max, digits);

        var labelElem = document.createElement("label");
        labelElem.classList.add("param");
        labelElem.textContent = T(label);
        labelElem.appendChild(value);

        return labelElem;

    },
    createValue: function(label, value, digits) {
        var valueElem = document.createElement("span");
        digits = digits || 0;
        if (value instanceof Object) {
            value = value.Current;
        }
        valueElem.textContent = util.toFixed(value, digits);

        var labelElem = document.createElement("label");
        labelElem.classList.add("param");
        labelElem.textContent = T(label);
        labelElem.appendChild(valueElem);

        return labelElem;
    },
    sync: function() {
        if (this.panel && !this.panel.visible)
            return;
        this.update();
    },
    update: function() {
        this.equipContainer.update();
        this.createSection("summary");
        var name = document.createElement("div");
        name.textContent = '[' + game.player.Name + ']';
        this.summary.appendChild(name);
        var lvl = document.createElement("div");
        lvl.textContent = T("Level") + " " + game.player.Lvl;
        this.summary.appendChild(lvl);

        this.createSection("equip");
        for(var i = 0, l = this.equipContainer.slots.length; i < l; i++) {
            this.equip.appendChild(this.equipContainer.slots[i]);
        }

        this.createSection("doll");
        this.characterImage = game.player.icon();
        this.doll.appendChild(this.characterImage);

        this.createSection("vital");
        this.vital.appendChild(this.createParam("Hp", game.player.Hp, 2));
        this.vital.appendChild(this.createParam("Fullness", game.player.Fullness, 2));
        this.vital.appendChild(this.createParam("Stamina", game.player.Stamina, 2));

        this.createSection("main");

        var attributes = document.createElement("div");
        attributes.className = "attributes";
        var attrs = ["Strength", "Vitality", "Dexterity", "Intellect", "Perception", "Wisdom"];
        attrs.forEach(function(attr) {
            attributes.appendChild(this.createValue(attr, game.player.Attr[attr], 2));
        }.bind(this));

        var health = document.createElement("div");
        health.className = "health";
        var vitamins = ["Protein", "Fat", "Carbohydrate", "Phosphorus", "Calcium", "Magnesium"];
        vitamins.forEach(function(vitamin) {
            health.appendChild(this.createValue(vitamin, game.player.Health[vitamin], 2));
        }.bind(this));

        this.main.appendChild(attributes);
        this.main.appendChild(health);

        this.createSection("params");
        this.params.appendChild(this.createParam("Speed", game.player.Speed));
        this.params.appendChild(this.createParam("Armor", game.player.Armor));
        this.params.appendChild(this.createParam("Defence", game.player.Defence));
        this.params.appendChild(this.createParam("Accuracy", game.player.Accuracy));

        this.createSection("exp");
        this.exp.appendChild(this.createParam("Exp", game.player.Exp));
        this.exp.appendChild(this.createValue("Learning points", game.player.LP));

        this.createSection("social");
        this.social.appendChild(this.createValue("Karma", game.player.Karma));
        this.social.appendChild(this.createValue("Fame", game.player.Fame));
        this.social.appendChild(util.hr());

        this.createSection("statistics");
        this.statistics.appendChild(this.createValue("Kills", game.player.Statistics.Kills));
        this.statistics.appendChild(this.createValue("Players killed", game.player.Statistics.PlayersKilled));
        this.statistics.appendChild(this.createValue("Death", game.player.Statistics.Death));
        this.statistics.appendChild(util.hr());
    },
    createSection: function(name) {
        if (!this[name]) {
            this[name] = document.createElement("div");
            this[name].className = name;
        } else {
            this[name].innerHTML = "";
        }
    },
    checkCollision: function() {
        if(!this.panel.visible)
            return null;

        var x = game.controller.mouse.x;
        var y = game.controller.mouse.y;
        for(var i = 0, l = this.equipContainer.slots.length; i < l; i++) {
            var rx = this.panel.x + this.equipContainer.slots[i].offsetLeft;
            var ry = this.panel.y + this.equipContainer.slots[i].offsetTop;
            if(util.intersects(
                x,
                y,
                rx,
                ry,
                CELL_SIZE,
                CELL_SIZE
            )) {
                return this.equipContainer.slots[i];
            }

        }
        return null;
    }
}
