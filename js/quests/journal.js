function QuestJournal() {
    this.list = document.createElement("ul");

    this.view = document.createElement("div");
    this.panel = new Panel("quest-journal", "Quests", [this.list, this.view]);
    this.update();
}

QuestJournal.prototype = {
    update: function() {
        this.list.innerHTML = "";
        for (var id in game.player.ActiveQuests) {
            var quest = new Quest(game.player.ActiveQuests[id].Quest);
            var li = document.createElement("li");
            quest.renderDesc().forEach(li.appendChild.bind(li));
            this.list.appendChild(li);
        }
    },
};
