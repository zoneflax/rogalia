"use strict";
function Journal() {
    this.list = document.createElement("ol");
    this.list.id = "quest-list";
    this.view = document.createElement("div");
    this.view.id = "quest-desc";
    this.panel = new Panel("journal", "Journal", [
        this.list,
        util.vr(),
        this.view,
    ]);
    this.update();
    this.panel.hooks.show = this.update.bind(this);
    this.hash = "";
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
        this.list.innerHTML = "";

        Object.keys(game.player.ActiveQuests).forEach(function(id) {
            var quest = new Quest(game.player.ActiveQuests[id].Quest);
            var name = document.createElement("li");
            name.className = "quest";
            name.textContent = quest.getName();
            name.onclick = function() {
                util.dom.removeClass(".quest", "selected");
                name.classList.add("selected");
                this.view.innerHTML = "";
                var title = document.createElement("b");
                title.textContent = quest.getName();
                this.view.appendChild(title);
                quest.getDescContents().forEach(this.view.appendChild.bind(this.view));
            }.bind(this);
            this.list.appendChild(name);
        }.bind(this));
    },
};
