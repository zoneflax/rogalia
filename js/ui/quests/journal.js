"use strict";
function Journal() {
    this.list = document.createElement("ol");
    this.list.id = "quest-list";
    this.view = document.createElement("div");
    this.view.id = "quest-desc";
    this.panel = new Panel("journal", "Journal", [
        this.list,
        dom.vr(),
        this.view,
    ]);
    this.update();
    this.hash = "";
    this.selected = null;
    this.selectedQuest = null;

    var self = this;
    this.panel.hooks.show = function() {
        self.update();
        selectFirst();
    };

    selectFirst();

    function selectFirst() {
        if (!self.selected && self.list.firstElementChild) {
            self.list.firstElementChild.click();
        }
    }
}

Journal.prototype = {
    update: function() {
        if (this.panel && !this.panel.visible)
            return;

        if (this.selectedQuest)
            this.selectedQuest.update();

        var hash = JSON.stringify(game.player.ActiveQuests);
        if (hash == this.hash)
            return;
        this.hash = hash;

        if (Object.keys(game.player.ActiveQuests).length == 0) {
            dom.setContents(this.list, T("No quests"));
            return;
        }
        dom.clear(this.list);

        var self = this;
        Object.keys(game.player.ActiveQuests).forEach(function(id) {
            var quest = new Quest(game.player.ActiveQuests[id].Quest);
            var name = document.createElement("li");
            name.className = "quest";


            if (id == self.selected)
                name.classList.add("selected");

            name.textContent = quest.getName();
            name.onclick = function() {
                dom.removeClass(".quest", "selected");
                self.selected = id;
                self.selectedQuest = quest;
                name.classList.add("selected");

                dom.setContents(self.view, [
                    dom.wrap("quest-title", quest.getName()),
                    dom.hr(),
                    dom.wrap("quest-start", util.ucfirst(T(quest.Start)) + ":"),
                ].concat(quest.getDescContents()));
            };
            self.list.appendChild(name);
        });
    },
};
