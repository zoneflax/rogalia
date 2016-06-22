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
    update: function(){},
    makeList: function makeList(items) {
        var updater = [];
        this.update = function() {
            var found = game.player.findItems(Object.keys(items));
            updater.forEach(function(update) {
                update(found);
            });
        };

        var list = document.createElement("div");
        var craft = game.controller.craft;
        var kinds = Object.keys(items);
        var found = game.player.findItems(kinds);
        updater = kinds.map(function(item) {
            var slot = dom.wrap("slot", Entity.getPreview(item));
            slot.onclick = craft.search.bind(craft, item, true);

            var count = (items[item] instanceof Object) ? items[item].Count : items[item];
            var desc = dom.wrap("quest-slot-desc", TS(item) + ": " + found[item].length + "/" + count);
            list.appendChild(dom.wrap("quest-item", [slot, desc]));
            return function(found) {
                desc.textContent = TS(item) + ": " + found[item].length + "/" + count;
            };
        });
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
        var self = this;
        var goal = this.Goal;

        return dom.wrap("quest-goal", [
            end(),
            delimiter(),
            goals(),
            tip(),
            wiki(),

        ]);

        function end() {
            return dom.make("div", T("Quest ender") + ": " + TS(self.End));
        }

        function delimiter() {
            return (goal.HaveItems || goal.BringItems || goal.Cmd)
                ? dom.hr()
                : null;
        }

        function goals() {
            return dom.make("ul", [
                haveItems(),
                bringItems(),
                cmd(),
            ]);

            function cmd() {
                if (!goal.Cmd)
                    return null;
                var goals = {
                    drink: "drink something",
                    eat: "eat something",
                    waza: "hit a training dummy",
                };
                var what = goals[goal.Cmd] || goal.Cmd;
                return dom.make("li", T("You need to") + " " + T(what) + "");
            }

            function bringItems() {
                return (goal.HaveItems)
                    ? dom.make("li", [
                        dom.text(T("You need to have these items") + ":"),
                        self.makeList(goal.HaveItems),
                    ])
                    : null;
            }

            function haveItems() {
                return (goal.Bringitems)
                    ? dom.make("li", [
                        dom.text(T("You need to bring these items") + ":"),
                        self.makeList(goal.BringItems),
                    ])
                    : null;
            }
        }

        function tip() {
            if (!self.data.tip)
                return null;
            var tip = dom.tag("p");
            tip.innerHTML = self.data.tip[game.lang];
            return dom.make("div", [
                dom.hr(),
                tip,
            ]);
        }

        function wiki() {
            if (!self.data.wiki)
                return null;
            var links = self.data.wiki[game.lang] || [];
            return dom.make("div", links.map(function(name) {
                return dom.link("/wiki/" + name, name, "quest-wiki-link");
            }));
        }
    },
    makeReward: function() {
        var reward = this.Reward;
        return dom.make("div", [
            T("Rewards") + ": ",
            reward.Xp && dom.make("div", "+" + reward.Xp + "xp"),
            reward.Currency && Vendor.createPrice(reward.Currency),
            reward.Items && this.makeList(reward.Items),
        ]);
    },
    getContents: function() {
        var self = this;
        var canStart = !this.active();
        var canEnd = canEndTest();

        function canEndTest() {
            return self.ready() && nearEndNpc();
        }

        function nearEndNpc() {
            return self.npc
                && self.npc.Type == self.End
                && game.player.canUse(self.npc);
        }

        var action = (canStart) ? "Accept" : "Finish";
        var button = dom.button(T(action));


        if (canStart || canEnd) {
            button.onclick = function() {
                game.network.send(
                    "quest",
                    {Id: game.player.interactTarget.Id, QuestId: self.Id},
                    function update(data) {
                        if (canEndTest())
                            game.panels.quest.setContents(self.getContents());
                        else
                            game.panels.quest.close();
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
