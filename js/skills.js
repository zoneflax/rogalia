"use strict";
function Skills() {
    this.current = null;

    this.skills = document.createElement("div");
    this.skills.id = "skill-list";

    this.description = document.createElement("div");
    this.description.classList.add("description");
    this.description.textContent = T("Select skill to see it's description");

    this.learnButton = document.createElement("button");
    this.learnButton.textContent = T("Learn");
    this.learnButton.onclick = this.learn.bind(this);
    this.learnButton.disabled = true;

    this.panel = new Panel(
        "skills",
        "Skills",
        [
            this.skills,
            util.hr(),
            this.description,
            util.hr(),
            this.learnButton,
        ]
    );
    this.update();
    this.panel.hooks.show = this.update.bind(this);
    this.hash = "";
}

Skills.prototype = {
    update: function() {
        if (this.panel && !this.panel.visible)
            return;
        var hash = JSON.stringify(game.player.Skills) + game.player.LP;
        if (hash == this.hash)
            return;
        this.hash = hash;

        this.skills.innerHTML = "";

        var max = 100;
        Object.keys(game.player.Skills).forEach(function(name) {
            var skill = game.player.Skills[name];
            var item = Stats.prototype.createParam(
                name,
                {Current: skill.Value.Current, Max: max},
                2,
                false,
                "skills/" + name
            );
            if (skill.Value.Current == max) {
                item.getElementsByClassName("meter-title")[0].textContent = "max";
            }
            item.name = name;
            item.skill = skill;
            item.classList.add("skill");
            if (skill.Value.Current == skill.Value.Max && skill.Value.Max != max) {
                item.classList.add("capped");
                item.title = T("Skill is capped");
            }
            item.onclick = this.select.bind(this, item);
            this.skills.appendChild(item);

            if (this.current && this.current.name == name)
                this.select(item);
        }.bind(this));
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
        var text = T("Value") + ": " + Stats.formatParam(skill.Value) + "\n";

        if (this.descriptions[name])
            text += this.descriptions[name] + "\n\n";

        var next = this.nextLvlOf(skill);
        if (!next) {
            text += T("Skill has it's maximum level");
        } else {
            text += TT("Unlocks {lvl} lvl of the {skill} skill", {lvl: next.Name, skill: name});
            text += "\n\n";
            text += T("New maximum value") + ": " + next.Value + "\n";
            text += T("Cost") + ": " + next.Cost + "\n";
            text += TT("You have {amount} LP", {amount: game.player.LP});
            text += "\n";

            var diff = next.Cost - game.player.LP;
            if(diff > 0) {
                text += TT("You need {diff} additional LP to learn this skill", {diff: diff});
                this.learnButton.disabled = true;
            } else {
                this.learnButton.disabled = false;
            }
        }
        this.description.textContent = text;
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
