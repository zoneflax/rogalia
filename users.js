function Users() {
    this.characters = [];
    this.listElement = document.createElement("ul");
    var usersLabel = document.createElement("div");
    usersLabel.textContent = T("Users online:");
    var total = document.createElement("div");
    this.panel = new Panel(
        "users",
        "Users",
        [usersLabel, this.listElement, total]
    );

    this.playersList = {};

    this.addCharacter = function(name) {
        var user = this.playersList[name];

        if (!user) {
            user = document.createElement("li");;
            user.className = "user";
            user.href = "javascript://";
            user.textContent = name;
            if (game.player.IsAdmin) {
                var teleport = document.createElement("a");
                teleport.textContent = "[Teleport]";
                teleport.addEventListener('click', function() {
                    game.network.send('teleport', {name: name});
                });
                user.appendChild(teleport);

                var summon = document.createElement("a");
                summon.textContent = '[Summon]';
                summon.onclick = function() {
                    game.network.send('summon', {name: name});
                    return false;
                };
                user.appendChild(summon);
            }

            this.listElement.appendChild(user);
            this.playersList[name] = user;
        }
    };

    this.sync = function(data) {
        if (!data)
            return;
        this.characters = data;
        this.update();
    };

    this.update = function() {
        if (!this.panel.visible)
            return;

        var count = 0;
        for(var name in this.characters) {
            count++;
            this.addCharacter(name);
        }

        for(var name in this.playersList) {
            if (!this.characters[name]) {
                this.playersList[name].parentNode.removeChild(this.playersList[name]);
                delete this.playersList[name];
            }
        }
        total.textContent = T("Total") + ": " + count;
    };

    this.panel.hooks.show = this.update.bind(this);
}
