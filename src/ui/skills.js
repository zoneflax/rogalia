/* global game, Character, Panel, dom, T, ParamBar */

"use strict";
function Skills() {
    this.current = null;

    this.skills = dom.div("#skill-list");
    this.description = dom.div("description", {text : T("Select skill to see it's description")});
    this.learnButton = dom.button(T("Learn"), "", this.learn.bind(this));
    this.learnButton.disabled = true;

    this.panel = new Panel(
        "skills",
        "Skills",
        [
            this.skills,
            dom.hr(),
            this.description,
            dom.hr(),
            this.learnButton,
        ]
    );
    this.update();
    this.panel.hooks.show = this.update.bind(this);
    this.hash = "";
}

Skills.byAttr = {
    strength: ["Carpentry", "Metalworking", "Leatherworking"],
    vitality: ["Stoneworking", "Mining", "Lumberjacking"],
    dexterity: ["Pottery", "Tailoring", "Swordsmanship"],
    intellect: ["Mechanics", "Alchemy"],
    perception: ["Survival", "Farming", "Fishing"],
    wisdom: ["Herbalism", "Cooking", "Leadership"],
};

Skills.prototype = {
    update: function() {
        if (this.panel && !this.panel.visible)
            return;
        var hash = JSON.stringify(game.player.Skills) + game.player.LP;
        if (hash == this.hash)
            return;
        this.hash = hash;

        dom.clear(this.skills);

        var max = 100;
        for (var attr in Skills.byAttr) {
            Skills.byAttr[attr].forEach(function(name) {
                var skill = game.player.Skills[name];
                var item = ParamBar.makeParam(
                    name,
                    skill.Value,
                    2,
                    false,
                    "skills/" + name
                );
                if (skill.Value.Current == max) {
                    item.getElementsByClassName("meter-title")[0].textContent = "max";
                } else if (game.player.Attr[util.ucfirst(attr)].Current <= skill.Value.Current) {
                    item.classList.add("attr-" + attr);
                    item.locked = true;
                }
                item.attr = attr;
                item.name = name;
                item.skill = skill;
                item.classList.add("skill");
                item.title = TT("This skill cannot be greater then {attr}", {attr: attr});
                dom.insert(dom.span("◾ ", "attr-" + attr), item);
                if (skill.Value.Current == skill.Value.Max && skill.Value.Max != max) {
                    item.classList.add("capped");
                    item.title = T("Skill is capped");
                }
                item.onclick = this.select.bind(this, item);
                this.skills.appendChild(item);

                if (this.current && this.current.name == name)
                    this.select(item);
            }.bind(this));
        }
    },
    select: function(item) {
        if (this.current) {
            this.current.classList.remove("selected");
        }
        item.classList.add("selected");
        this.current = item;
        this.showDescription(item);
    },
    nextLvlOf: function(skill) {
        for (var i in Character.skillLvls) {
            var next = Character.skillLvls[i];
            if (next.Value > skill.Value.Max)
                return next;
        }
        return null;
    },
    showDescription: function(item) {
        var skill = item.skill;
        var name = item.name;
        var text = T("Value") + ": " + ParamBar.formatParam(skill.Value) + "\n";

        if (this.descriptions[name])
            text += this.descriptions[name] + "\n\n";

        var next = this.nextLvlOf(skill);
        if (!next) {
            dom.setContents(this.description, T("Skill has it's maximum level"));
            return;
        }

        var diff = next.Cost - game.player.LP;
        var notEnoughLP = diff > 0;
        this.learnButton.disabled = notEnoughLP;

        var locked = (item.locked)
            ? dom.span(TT("This skill cannot be greater then {attr}", {attr: item.attr}) + "\n", "unavailable")
            : "\n";

        var lpRequired = (notEnoughLP)
            ? (TT("You need {diff} additional LP to learn this skill", {diff}) + "\n")
            : null;

        dom.setContents(this.description, [
            TT("Unlocks {lvl} lvl of the {skill} skill", {lvl: next.Name, skill: name}) + "\n",
            locked,
            T("New maximum value") + ": " + next.Value + "\n",
            T("Cost") + ": " + next.Cost + "\n",
            TT("You have {amount} LP", {amount: game.player.LP}) + "\n",
            lpRequired,
        ]);
    },
    descriptions: {
        "Survival": "Survival gives you basic recipes like bonfire",
        "Stoneworking": "Stoneworking gives you recipes like sharp stone, stone axe, stone hammer, etc.",
        "Lumberjacking": "Lumberjacking gives you an ability to chop trees.",
    },

    learn: function(e) {
        if (!this.current)
            game.error("No selected skill");
        game.network.send("learn-skill", {name: this.current.name });
    },
};
