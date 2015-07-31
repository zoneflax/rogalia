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
    getLog: function() {
        return game.player.ActiveQuests[this.Id];
    },
    // getMarker: function() {
    //     var marker = document.createElement("span");
    //     if (this.ready()) {
    //         marker.textContent = "?";
    //         marker.style.color = "yellow";
    //     } else if (!this.getLog()) {
    //         marker.textContent = "!";
    //         marker.style.color = "yellow";
    //     } else {
    //         marker.textContent = "?";
    //         marker.style.color = "grey";
    //     }
    //     return marker;
    // },
    ready: function() {
        var questLog = this.getLog();
        return questLog && questLog.State == "ready";
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
        var contents = [
            this.makeDesc(),
            util.hr(),
        ];

        var goal = this.makeGoal();
        if (goal.children.length > 0) {
            contents.push(goal);
            contents.push(util.hr());
        }

        contents.push(this.makeReward());
        return contents;

    },
    makeDesc: function() {
        var desc = document.createElement("div");
        var source = (this.ready()) ? this.data.final : this.data.desc;
        desc.textContent = source[game.lang];
        return desc;
    },
    makeGoal: function() {
        var goal = document.createElement("div");

        if (!this.ready()) {
            var end = document.createElement("div");
            end.textContent = T("Who") + ": " + this.End;
            goal.appendChild(end);
        }

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
    makeReward: function() {
        var reward = document.createElement("div");
        reward.appendChild(document.createTextNode(T("Rewards") + ":"));
        if (this.Reward.Xp) {
            var xp = document.createElement("div");
            xp.textContent = "+" + this.Reward.Xp + "xp";
            reward.appendChild(xp);
        }
        if (this.Reward.Currency) {
            reward.appendChild(Vendor.createPrice(this.Reward.Currency));
        }
        if (this.Reward.Items) {
            reward.appendChild(this.makeList(this.Goal.BringItems));
        }

        return reward;
    },
    getContents: function() {
        var canStart = !this.getLog();
        var action = (canStart) ? "Accept" : "Finish";

        var button = document.createElement("button");
        button.textContent = T(action);

        var nearEndNpc = game.player.interactTarget.Name == this.End;
        var canEnd = this.ready() && nearEndNpc;

        if (canEnd || canStart) {
            var self = this;
            button.onclick = function() {
                game.network.send("quest", {QuestId: self.Id}, function update(data) {
                    if (!data.Done) {
                        return update;
                    }
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

        return this.getDescContents().concat(
            util.hr(),
            button
        );
    },
};
