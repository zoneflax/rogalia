"use strict";
function Quest(q) {
    for (var i in q) {
        this[i] = q[i];
    }
    this.data = game.quests[q.Id];
}

Quest.prototype = {
    getName: function() {
        return this.data.name[game.lang];
    },
    makeList: function(items) {
            var list = document.createElement("div");
            for (var item in items) {
                var li = document.createElement("div");
                li.textContent = TS(item) + ": x" + items[item];
                list.appendChild(li);
            }
            return list;
    },
    getDescContents: function() {
        return [
            this.makeDesc(),
            util.hr(),
            this.makeGoal(),
            util.hr(),
            this.makeRewards(),
        ];
    },
    makeDesc: function() {
        var desc = document.createElement("div");
        desc.textContent = this.data.desc[game.lang];
        return desc;
    },
    makeGoal: function() {
        var goal = document.createElement("div");

        var end = document.createElement("div");
        end.textContent = T("Who") + ": " + this.End;
        goal.appendChild(end);

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

        return goal;
    },
    makeRewards: function() {
        var rewards = document.createElement("div");
        rewards.appendChild(document.createTextNode(T("Rewards") + ":"));

        if (this.Reward.Xp) {
            var xp = document.createElement("div");
            xp.textContent = "+" + this.Reward.Xp + "xp";
            rewards.appendChild(xp);
        }
        if (this.Reward.Currency) {
            rewards.appendChild(Vendor.createPrice(this.Reward.Currency));
        }
        if (this.Reward.Items) {
            rewards.appendChild(this.makeList(this.Goal.BringItems));
        }

        return rewards;
    },
    getContents: function() {
        var desc = this.getDescContents();
        desc.push(util.hr());

        var id = this.Id;
        var questLog = game.player.ActiveQuests[id];
        var action = "";
        if (!questLog) {
            action = "Accept";
        } else if (questLog.State == "ready") {
            action = "Finish";
        }
        if (action) {
            var button = document.createElement("button");
            button.textContent = T(action);
            var self = this;
            button.onclick = function() {
                game.network.send("quest", {QuestId: id}, function update(data) {
                    if (!data.Done) {
                        return update;
                    }

                    if (!questLog && game.player.interactTarget.Name == self.End)
                        game.panels.quest.setContents(self.getDescContents());
                    else
                        game.panels.quest.close();
                    return null;
                });
            };
            desc.push(button);
        }

        return desc;
    },
};
