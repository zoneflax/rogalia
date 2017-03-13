/* global game, dom, Vendor, T, TS, util */

"use strict";
function Quest(q, npc) {
    for (var i in q) {
        this[i] = q[i];
    }
    this.data = Quest.quests[q.Id];
    this.npc = npc;
    this.panel = null;
}

Quest.prototype = {
    getName: function() {
        return this.data.name;
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
    showPanel: function() {
        var panel = this.panel = new Panel("quest", "Quest", []);
        panel.hooks.hide = function() {
            game.sound.stopVoice();
        };
        panel.setContents(this.getContents(true));
        panel.quest = this;
        panel.entity = this.npc;
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

        var list = dom.div();
        var kinds = Object.keys(items);
        var found = game.player.findItems(kinds);
        updater = kinds.map(function(item) {
            var slot = dom.wrap("slot", Entity.getPreview(item), {
                onclick: () => game.controller.craft.searchOrHelp(item),
            });

            var count = (items[item] instanceof Object) ? items[item].Count : items[item];
            var desc = dom.wrap("quest-slot-desc", TS(item) + ": " + found[item].length + "/" + count);
            dom.append(list, dom.wrap("quest-item", [slot, desc]));
            return function(found) {
                desc.textContent = TS(item) + ": " + found[item].length + "/" + count;
            };
        });
        return list;
    },
    getDescContents: function(ready) {
        var goal = this.makeGoal();
        return [
            this.data.name,
            dom.hr(),
            this.makeDesc(ready),
            goal,
            (goal.children.length > 0) ? dom.hr() : null,
            dom.make("div", T("Quest ender") + ": " + TS(this.End)),
            dom.hr(),
            this.makeReward(),
        ];
    },
    makeDesc: function(ready) {
        var desc = (ready && this.data.final) ? this.data.final : this.data.desc;
        return dom.wrap("desc", util.mklist(desc).map(function(html) {
            return dom.tag("p", "", {html});
        }));
    },
    makeGoal: function() {
        var self = this;
        var goal = this.Goal;

        return dom.wrap("quest-goal", [
            goals(),
            tip(),
            wiki(),
        ]);

        function goals() {
            if (!goal.HaveItems && !goal.BringItems && !goal.Cmd && !goal.Use) {
                return null;
            }

            return dom.make("ul", [
                haveItems(),
                bringItems(),
                cmd(),
                use(),
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
                return dom.make("li", T("You need to") + " " + TS(what) + "");
            }

            function use() {
                return goal.Use && dom.make("li", T("You need to") + " " + T("use") + " " + TS(goal.Use));
            }

            function bringItems() {
                return (goal.BringItems)
                    ? dom.make("li", [
                        dom.text(T("You need to bring these items") + ":"),
                        self.makeList(goal.BringItems),
                    ])
                    : null;
            }

            function haveItems() {
                return (goal.HaveItems)
                    ? dom.make("li", [
                        dom.text(T("You need to have these items") + ":"),
                        self.makeList(goal.HaveItems),
                    ])
                    : null;
            }
        }

        function tip() {
            return self.data.tip && dom.make("div", [
                dom.hr(),
                dom.tag("p", "", {html: self.data.tip})
            ]);
        }

        function wiki() {
            if (!self.data.wiki)
                return null;
            var links = self.data.wiki || [];
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
            reward.Custom && this.data.customReward
        ]);
    },
    getContents: function(autoplay) {
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

        function hasNextQuest() {
            return nearEndNpc() && self.npc.getQuests().length > 0;
        }

        function showNextQuest() {
            var quest = new Quest(self.npc.getQuests()[0], self.npc);
            quest.showPanel();
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
                            self.panel.setContents(self.getContents(true));
                        else if (hasNextQuest())
                            showNextQuest();
                        else
                            self.panel.close();
                        return null;
                    });
            };
        } else {
            button.disabled = true;
        }


        var contents = this.getDescContents(canEnd).concat(
            dom.hr(),
            button
        );

        // if (this.data.voice) {
        //     var id = this.Id;
        //     var hasFinal = this.data.final;
        //     if (this.ready() && hasFinal) {
        //         id += "-final";
        //     }
        //     var pause = dom.img("assets/icons/pause.png", "icon-button");
        //     pause.onclick = function() {
        //         game.sound.toggleVoice();
        //         dom.replace(pause, play);
        //     };

        //     var play = dom.img("assets/icons/play.png", "icon-button");
        //     play.onclick = function() {
        //         game.sound.toggleVoice();
        //         dom.replace(play, pause);
        //     };


        //     var voiceButton = null;
        //     if (autoplay && (this.ready() && hasFinal || !this.active())) {
        //         game.sound.playVoice(id);
        //         voiceButton = pause;
        //     } else {
        //         game.sound.loadVoice(id);
        //         voiceButton = play;
        //     }
        //     contents.push(dom.wrap("quest-voice", voiceButton));

        //     game.sound.onVoiceEnded = function() {
        //         var replay = dom.img("assets/icons/replay.png", "icon-button");
        //         replay.onclick = function() {
        //             dom.replace(replay, pause);
        //             game.sound.replayVoice();
        //         };
        //         dom.replace(voiceButton, replay);
        //     };
        // }

        return contents;
    },
};
