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
    renderDesc: function() {
        var desc = document.createElement("p");
        desc.textContent = this.data.desc[game.lang];

        var goal = document.createElement("div");
        {
            var end = document.createElement("div");
            end.textContent = this.End + " " + T("wants:");
            goal.appendChild(end);
        }
        var makeList = function(items) {
            var list = document.createElement("ul");
            for (var item in items) {
                var li = document.createElement("li");
                li.textContent = TS(item) + ": x" + this.HaveItems[item];
                list.appendChild(li);
            }
            return list;
        }.bind(this);
        if (this.Goal.HaveItems) {
            goal.appendChild(document.createTextNode(T("You need to have these items:")));
            goal.appendChild(makeList(this.HaveItems));
        }
        if (this.Goal.BringItems) {
            goal.appendChild(document.createTextNode(T("You need to bring these items:")));
            goal.appendChild(makeList(this.Goal.BringItems));
        }

        var rewards = document.createElement("div");
        rewards.appendChild(document.createTextNode(T("Rewards:")));

        if (this.Reward.Xp) {
            var xp = document.createElement("div");
            xp.textContent = "+" + this.Reward.Xp + "xp";
            rewards.appendChild(xp);
        }
        if (this.Reward.Currency) {
            rewards.appendChild(Vendor.createPrice(this.Reward.Currency));
        }
        if (this.Reward.Items) {
            goal.appendChild(makeList(this.Goal.BringItems));
        }
        return [
            desc,
            util.hr(),
            goal,
            util.hr(),
            rewards,
        ];
    },
    renderContents: function() {
        var start = document.createElement("button");
        start.textContent = T("Accept");
        var id = this.Id;
        start.onclick = function() {
            game.network.send("quest", {QuestId: id});
            game.panels.quest.close();
        };
        var desc = this.renderDesc();
        desc.push(util.hr());
        desc.push(start);
        return desc;
    },
};
