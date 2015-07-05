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

Stats.formatParam = function(param, digits) {
    return util.toFixed(param.Current, digits) + ' / ' + util.toFixed(param.Max, digits);
};

Stats.prototype = {
    createParam: function(label, param, digits, useColors) {
        var max = param.Max || 0;
        var text = Stats.formatParam(param, digits);
        var meter = document.createElement("meter");
        if (useColors) {
            meter.low = 0.25*max;
            meter.high = 0.75*max;
            meter.optimum = max;
        }
        meter.max = (max == 0) ? 100 : max;
        meter.value = util.toFixed(param.Current, digits);
        meter.title = text;
        meter.textContent = text;

        var meterWrapper = document.createElement("div");
        meterWrapper.className = "meter-wrapper value";
        meterWrapper.appendChild(meter);


        if (config.ui.showMeterValues)  {
            var titleElem = document.createElement("div");
            titleElem.className = "meter-title";
            titleElem.textContent = text;
            meterWrapper.appendChild(titleElem);
        }

        var labelElem = document.createElement("label");
        labelElem.classList.add("param");
        labelElem.textContent = T(label);
        labelElem.appendChild(meterWrapper);
        return labelElem;

    },
    createValue: function(label, value, digits) {
        var valueElem = document.createElement("span");
        valueElem.classList.add("value");
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
        this.updateExp();

        this.equipContainer.update();
        this.createSection("summary");

        var player = game.player;

        var name = document.createElement("span");
        name.textContent = player.Name;
        this.summary.appendChild(name);

        var lvl = document.createElement("span");
        lvl.textContent = " " + T("level") + " " + player.Lvl;
        this.summary.appendChild(lvl);

        var faction = player.Citizenship.Faction;
        if (faction) {
            this.summary.appendChild(util.br());

            var citizenship = document.createElement("span");
            citizenship.style.marginTop = "10px";
            citizenship.textContent = T(faction);
            this.summary.appendChild(citizenship);

            var rank = document.createElement("span");
            rank.textContent = " " + T("rank") + ": " + player.Citizenship.Rank;
            this.summary.appendChild(rank);
        }

        this.createSection("equip");
        for(var i = 0, l = this.equipContainer.slots.length; i < l; i++) {
            var slot = this.equipContainer.slots[i];
            this.equip.appendChild(slot);
        }

        this.createSection("doll");
        var sex = player.sex();
        this.doll.classList.add(sex);
        var worn =  ["feet", "legs", "body", "head"].filter(function(name) {
            return !!player.equipSlot(name);
        });
        worn.push("naked");
        var dollStyle = worn.map(function(name) {
            return "url('assets/bg/doll/" + sex + "/" + name + ".png')";
        }).join(",");
        this.doll.style.backgroundImage = dollStyle;

        this.createSection("vital");
        ["Hp", "Fullness", "Stamina"].forEach(function(param) {
            this.vital.appendChild(this.createParam(param, player[param], 0, true));
        }.bind(this));

        this.createSection("main");

        var attributes = document.createElement("div");
        attributes.className = "attributes";
        var attrs = ["Strength", "Vitality", "Dexterity", "Intellect", "Perception", "Wisdom"];
        attrs.forEach(function(attr) {
            var elem = this.createValue(attr, player.Attr[attr], 2);
            elem.classList.add(attr.toLowerCase());
            attributes.appendChild(elem);
        }.bind(this));

        var health = document.createElement("div");
        health.className = "health";
        Character.vitamins.forEach(function(vitamin) {
            var elem = this.createValue(vitamin, player.Health[vitamin], 2);
            elem.classList.add(vitamin.toLowerCase());
            health.appendChild(elem);
        }.bind(this));

        this.main.appendChild(attributes);
        this.main.appendChild(util.vr());
        this.main.appendChild(health);

        this.createSection("params");
        ["Speed", "Armor", "Defence", "Accuracy"].forEach(function(param) {
            this.params.appendChild(this.createParam(param, player[param], 0, true));
        }.bind(this));

        this.createSection("exp");
        this.exp.appendChild(this.createParam("Exp", player.Exp));
        this.exp.appendChild(this.createValue("Learning points", player.LP));

        this.createSection("social");
        this.social.appendChild(this.createValue("Karma", player.Karma));
        this.social.appendChild(this.createValue("Fame", player.Fame));
        this.social.appendChild(util.hr());

        this.createSection("statistics");
        this.statistics.appendChild(this.createValue("Kills", player.Statistics.Kills));
        this.statistics.appendChild(this.createValue("Players killed", player.Statistics.PlayersKilled));
        this.statistics.appendChild(this.createValue("Death", player.Statistics.Death));
        var sp = {Current: player.Citizenship.StatusPoints, Max: Math.pow(10, player.Citizenship.Rank)}
        this.statistics.appendChild(this.createParam("Status points", sp));
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
    },
    updateExp: function() {
        var xp = document.getElementById("xp-progress");
        var exp = game.player.Exp
        var width = exp.Current/exp.Max * 100;
        xp.style.width = width + "%";
    },
}
