/* global game, dom, Vendor, T, TS, util, Panel, TT */

"use strict";
function Quest(q, npc) {
    for (var i in q) {
        this[i] = q[i];
    }
    this.data = Quest.quests[q.Id];
    this.data.chain = Quest.chains[this.Chain.Name] || this.Chain.Name;
    this.npc = npc;
    this.panel = null;
    this.items = [];
}

Quest.chains = {};

Quest.prototype = {
    getName() {
        return this.data.name;
    },
    getLog() {
        return game.player.ActiveQuests[this.Id];
    },
    active() {
        return !!this.getLog();
    },
    ready() {
        var questLog = this.getLog();
        return questLog && questLog.State == "ready";
    },
    getStatusMarker() {
        if (this.ready())
            return "?";
        if (this.active())
            return "…";
        return "!";
    },
    showPanel() {
        var panel = this.panel = new Panel("quest", "Quest", this.getContents());
        panel.hooks.hide = function() {
            game.sound.stopVoice();
        };
        panel.quest = this;
        panel.entity = this.npc;
        panel.show();
    },
    update(){
        this.goal = dom.replace(this.goal, this.makeGoal());
    },
    makeRewardList(items) {
        return dom.wrap("quest-items-container", [
            dom.wrap("quest-item-list", _.map(items, (item, kind) => {
                const required = (item instanceof Object) ? item.Count : item;
                return dom.wrap("quest-item", `${required}x ${TS(kind)}`);
            })),
            this.makeSlots(Object.keys(items)),
        ]);
    },
    makeSlots(kinds) {
        return dom.wrap("quest-item-icons slots-wrapper", kinds.map(kind => {
            return dom.wrap("slot", Entity.getPreview(kind, "quest-item-preview"), {
                title: TS(kind),
                onclick: () => game.controller.craft.searchOrHelp(kind),
            });
        }));
    },
    makeList(items) {
        const kinds = Object.keys(items).sort((a, b) => _.size(items[a]) - _.size(items[b]));
        this.items = this.items.concat(kinds);
        const available = game.player.findItems(kinds);
        return dom.wrap("quest-items-container", [
            dom.wrap("quest-item-list", kinds.map(kind => {
                const item = items[kind];
                const required = (item instanceof Object) ? item.Count : item;
                const has = available[kind].length;
                return dom.wrap(
                    "quest-item" + ((has >= required) ? " ready" : ""),
                    `${has}/${required} ${TS(kind)}`
                );
            })),
            this.makeSlots(kinds),
        ]);
    },
    makeChainHeader() {
        return this.Chain.Name && dom.wrap("quest-chain", [
            TS(this.data.chain),
            " ",
            this.Chain.Num,
            "/",
            this.Chain.Max,
            ":",
        ]);
    },
    makeNpcAvatar() {
        return dom.wrap("quest-npc-avatar", [
            TS(this.End),
            dom.img(`assets/characters/npcs/avatars/${this.End}.png`),
        ]);
    },
    makeDesc(ready) {
        const desc = (ready && this.data.final) ? this.data.final : this.data.desc;
        return dom.wrap("quest-desc", [
            this.makeNpcAvatar(),
        ].concat(util.mklist(desc).map(html => dom.tag("p", "", {html}))));
    },
    makeGoal() {
        var self = this;
        var goal = this.Goal;
        const progress = (this.getLog() || {}).Progress || {};
        this.items = [];

        return this.goal = dom.wrap("quest-goal", [
            goals(),
            tip(),
            wiki(),
        ]);

        function goals() {
            if (!goal.HaveItems && !goal.BringItems && !goal.Cmd && !goal.Use && !goal.Build) {
                return null;
            }


            return dom.wrap("quest-goals", [
                haveItems(),
                bringItems(),
                cmd(),
                build(),
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
                const done = (progress.Cmd) ? " quest-ok" : "";
                return dom.wrap("quest-cmd" + done, [
                    progress.Cmd && dom.wrap("quest-ok-mark", "✔"),
                    T("You need to") + " ",
                    dom.make("i", TS(what)),
                ]);
            }

            function build() {
                const done = (progress.Build) ? " quest-ok" : "";
                return goal.Build && dom.wrap("quest-build" + done, [
                    progress.Build && dom.wrap("quest-ok-mark", "✔"),
                    T("To build") + ": ",
                    game.controller.craft.makeLink(goal.Build),
                ]);
            }

            function use() {
                const done = (progress.Use) ? " quest-ok" : "";
                return goal.Use && dom.wrap("quest-use" + done, [
                    progress.Use && dom.wrap("quest-ok-mark", "✔"),
                    T("You need to") + " " + T("use") + " " + TS(goal.Use)
                ]);
            }

            function bringItems() {
                return goal.BringItems && dom.wrap("quest-bring-items", [
                    T("Bring") + ":",
                    self.makeList(goal.BringItems),
                ]);
            }

            function haveItems() {
                return goal.HaveItems && dom.wrap("quest-collect-items", [
                    T("Required") + ":",
                    self.makeList(goal.HaveItems),
                ]);
            }
        }

        function tip() {
            return self.data.tip && dom.wrap("quest-tip-container", [
                dom.img("assets/icons/quests/tip.png", "quest-tip-icon"),
                dom.div("quest-tip", {html: self.data.tip})
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
    makeReward() {
        const reward = this.Reward;
        return dom.wrap("quest-reward-container", [
            dom.wrap("quest-reward-header", T("Rewards") + ":"),
            dom.wrap("quest-rewards", [
                reward.Xp && dom.wrap("quest-xp", [
                    dom.wrap("slot", dom.img("assets/icons/quests/xp.png")),
                    "+" + reward.Xp + "xp",
                ]),
                reward.Currency && dom.wrap("quest-gold", [
                    dom.wrap("slot", dom.img("assets/icons/quests/gold.png")),
                    Vendor.createPrice(reward.Currency)
                ]),
                reward.Items && this.makeRewardList(reward.Items),
                reward.Custom && this.data.customReward,
            ]),
        ]);
    },
    canEnd() {
        return this.ready() && this.nearEndNpc();
    },
    nearEndNpc() {
        return this.npc && this.npc.Type == this.End && game.player.canUse(this.npc);
    },
    hasNextQuest() {
        return this.nearEndNpc() && this.npc.getQuests().length > 0;
    },
    showNextQuest() {
        // if player was teleported to a next quest instance, we must update npc to a new one
        const npc = game.characters.get(this.npc.Id) || game.characters.find(c => c.Type == this.npc.Type);
        new Quest(npc.getQuests()[0], npc).showPanel();
    },
    makeButton(canEnd) {
        const canStart = !this.active();
        const button =  dom.button(T((canStart) ? "Accept" : "Finish"), "quest-button");
        if (canStart || canEnd) {
            button.onclick = () => {
                game.network.send(
                    "quest",
                    {Id: this.npc.Id, QuestId: this.Id},
                    (data) => {
                        if (this.canEnd())
                            this.panel.setContents(this.getContents());
                        else if (this.hasNextQuest())
                            this.showNextQuest();
                        else
                            this.panel.close();
                        return null;
                    });
            };
        } else {
            button.disabled = true;
        }
        return button;
    },
    getContents(useButton = true) {
        const canEnd = this.canEnd();

        return dom.wrap("quest-container", [
            dom.wrap("quest-desc-container", [
                dom.wrap("quest-header", [
                    this.makeChainHeader(),
                    dom.wrap("quest-name", this.data.name)
                ]),
                this.makeDesc(canEnd),
                this.makeGoal(),
            ]),
            this.makeReward(),
            dom.hr(),
            dom.wrap("quest-footer", [
                dom.wrap("quest-ender-container", [
                    T("Quest ender") + ":",
                    dom.wrap("quest-ender", TS(this.End)),
                ]),
                useButton && this.makeButton(canEnd),
            ]),
        ]);
    },
    // makeSound(autoplay) {
    //     if (this.data.voice) {
    //         var id = this.Id;
    //         var hasFinal = this.data.final;
    //         if (this.ready() && hasFinal) {
    //             id += "-final";
    //         }
    //         var pause = dom.img("assets/icons/pause.png", "icon-button");
    //         pause.onclick = function() {
    //             game.sound.toggleVoice();
    //             dom.replace(pause, play);
    //         };

    //         var play = dom.img("assets/icons/play.png", "icon-button");
    //         play.onclick = function() {
    //             game.sound.toggleVoice();
    //             dom.replace(play, pause);
    //         };


    //         var voiceButton = null;
    //         if (autoplay && (this.ready() && hasFinal || !this.active())) {
    //             game.sound.playVoice(id);
    //             voiceButton = pause;
    //         } else {
    //             game.sound.loadVoice(id);
    //             voiceButton = play;
    //         }
    //         contents.push(dom.wrap("quest-voice", voiceButton));

    //         game.sound.onVoiceEnded = function() {
    //             var replay = dom.img("assets/icons/replay.png", "icon-button");
    //             replay.onclick = function() {
    //                 dom.replace(replay, pause);
    //                 game.sound.replayVoice();
    //             };
    //             dom.replace(voiceButton, replay);
    //         };
    //     }
    // }
};
