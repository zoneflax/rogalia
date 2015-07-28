function QuestJournal() {
    var list = document.createElement("ul");
    for (var id in game.player.ActiveQuests) {
        var quest = game.quests[id];
        var li = document.createElement("li");
        li.textContent = quest.name[game.lang];
    }

    var view = document.createElement("div");
    this.panel = new Panel("quest-journal", "Quests", [list, view]);
}
