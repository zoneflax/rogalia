"use strict";
function Quest(q, npc) {
    for (var i in q) {
        this[i] = q[i];
    }
    this.data = game.quests[q.Id];
    this.npc = npc;
}

Quest.prototype = {
    getName: function() {
        return this.data.name[game.lang];
    },
    getLog: function() {
        return game.player.ActiveQuests[this.Id];
    },
    active: function() {
        return !!this.getLog();
    },
    ready: function() {
        var questLog = this.getLog();
        return questLog && questLog.State == "ready";
    },
    getStatusMarker: function() {
        if (this.ready())
            return "?";
        if (this.active())
            return "…";
        return "!";
    },
    showPanel: function(entity) {
        var panel = new Panel("quest", "Quest", this.getContents());
        panel.quest = this;
        panel.entity = entity;
        panel.show();
    },
    makeList: function(items) {
        var list = document.createElement("div");
        for (var item in items) {
            var slot = document.createElement("div");
            slot.classList.add("slot");
            slot.appendChild(Entity.getPreview(item));
            slot.onclick = game.controller.craft.search.bind(game.controller.craft, item, true);

            var desc = document.createElement("div");
            var count = (items[item] instanceof Object) ? items[item].Count : items[item];
            desc.textContent = TS(item) + ": x" + count;

            var li = document.createElement("div");
            li.className = "quest-item";
            li.appendChild(slot);
            li.appendChild(desc);
            list.appendChild(li);
        }
        return list;
    },
    getDescContents: function(ready) {
        return [
            this.npc && this.npc.avatar(),
            this.makeDesc(ready),
            dom.hr(),
            this.makeGoal(),
            dom.hr(),
            this.makeReward(),
        ];
    },
    makeDesc: function(ready) {
        var source = (ready) ? this.data.final : this.data.desc;
        var desc = source[game.lang] || this.data.desc[game.lang];
        return dom.wrap("desc", util.mklist(desc).map(function(html) {
            var p = dom.tag("p");
            p.innerHTML = html;
            return p;
        }));
    },
    makeGoal: function() {
        var goal = document.createElement("div");

        var end = document.createElement("div");
        end.textContent = T("Quest ender") + ": " + TS(this.End);
        goal.appendChild(end);

        if (this.Goal.HaveItems || this.Goal.BringItems || this.Goal.Cmd)
            goal.appendChild(dom.hr());

        if (this.Goal.HaveItems) {
            goal.appendChild(document.createTextNode(T("You need to have these items") + ":"));
            goal.appendChild(this.makeList(this.Goal.HaveItems));
        }
        if (this.Goal.BringItems) {
            goal.appendChild(document.createTextNode(T("You need to bring these items") + ":"));
            goal.appendChild(this.makeList(this.Goal.BringItems));
        }
        if (this.Goal.Cmd) {
            goal.appendChild(document.createTextNode(T("You need to") + ": " + TS(this.Goal.Cmd)));
        }

        if (this.data.tip) {
            var tip = dom.tag("p");
            tip.innerHTML = this.data.tip[game.lang];
            goal.appendChild(dom.hr());
            goal.appendChild(tip);
        }
        if ("wiki" in this.data) {
            var links = this.data.wiki[game.lang] || [];
            links.forEach(function(name) {
                var link = document.createElement("a");
                link.className = "quest-wiki-link";
                link.target = "_blank";
                link.href = "/wiki/" + name;
                link.textContent = name;
                goal.appendChild(link);
            });
        }

        return goal;
    },
    makeReward: function() {
        var reward = document.createElement("div");
        reward.appendChild(document.createTextNode(T("Rewards") + ": "));
        if (this.Reward.Xp) {
            var xp = document.createElement("div");
            xp.textContent = "+" + this.Reward.Xp + "xp";
            reward.appendChild(xp);
        }
        if (this.Reward.Currency) {
            reward.appendChild(Vendor.createPrice(this.Reward.Currency));
        }
        if (this.Reward.Items) {
            reward.appendChild(this.makeList(this.Reward.Items));
        }

        return reward;
    },
    getContents: function() {
        var canStart = !this.active();
        var action = (canStart) ? "Accept" : "Finish";

        var button = document.createElement("button");
        button.textContent = T(action);

        var nearEndNpc = this.npc && this.npc.Type == this.End;
        var canEnd = this.ready() && nearEndNpc;

        if (canEnd || canStart) {
            var self = this;
            button.onclick = function() {
                game.network.send(
                    "quest",
                    {Id: game.player.interactTarget.Id, QuestId: self.Id},
                    function update(data) {
                        if (canEnd || !nearEndNpc)
                            game.panels.quest.close();
                        else
                            game.panels.quest.setContents(self.getContents());
                        return null;
                    });
            };
        } else {
            button.disabled = true;
        }

        return this.getDescContents(canEnd).concat(
            dom.hr(),
            button
        );
    },
};
