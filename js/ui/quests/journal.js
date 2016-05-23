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
    this.panel.hooks.show = this.update.bind(this);
    this.hash = "";
    this.selected = null;
}

Journal.prototype = {
    update: function() {
        if (this.panel && !this.panel.visible)
            return;

        var hash = JSON.stringify(game.player.ActiveQuests);
        if (hash == this.hash)
            return;
        this.hash = hash;

        if (Object.keys(game.player.ActiveQuests).length == 0) {
            this.list.innerHTML = T("No quests") ;
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
