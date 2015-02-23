function Chat() {
    var self = this;
    this.useNotifications = false;

    this.initNotifications = function() {
        if (!("Notification" in window))
            return;
        switch(Notification.permission) {
        case "granted":
            this.useNotifications = true;
            break;
        case "default":
            Notification.requestPermission(function(status) {
                this.useNotifications = (status == "granted");
            }.bind(this));
        }
    };
    this.initNotifications();

    this.messagesElement = document.createElement("ul");
    this.messagesElement.className = "messages no-drag";

    this.newMessageElement = document.createElement("input");
    this.newMessageElement.id = "new-message"

    this.send = function(message) {
        game.network.send("chat-message", {message: message});
    };

    this.linkEntity = function(entity) {
        if (!entity)
            return;
        var text = entity.name || entity.Name;
        this.send("${" + text + "}", true);
        if (game.player.IsAdmin || entity.Group == "portal") {
            this.addMessage("id: " + entity.Id);
        }
    };

    this.linkRecipe = function(type) {
        this.send("${recipe:" + type +"}");
    };

    var myMessages = {
        ring: [],
        current: 0,
        backup: "",
    };
    myMessages.last = function() {
        if (this.ring.length == 0)
            return null;
        return this.ring[this.ring.length-1];
    }
    myMessages.prev = function() {
        this.current = Math.max(0, this.current-1);
        if (this.ring.length == 0)
            return this.backup;

        return this.ring[this.current];
    }
    myMessages.next = function() {
        this.current = Math.min(this.ring.length, this.current+1);
        if (this.current == this.ring.length)
            return this.backup;

        return this.ring[this.current];
    }
    myMessages.save = function(message) {
        if (this.current >= this.ring.length)
            this.backup = message;
    }
    myMessages.push = function(message) {
        if (this.last() == message)
            return;

        this.ring.push(message);
        this.current = this.ring.length;
    }

    this.keydown = function(e) {
        var message = e.target.value;
        switch (e.keyCode) {
        case 38: //up
            myMessages.save(message);
            e.target.value = myMessages.prev()
            return true;
        case 40: //down
            e.target.value = myMessages.next()
            return true;
        case 13: //enter
            break;
        default:
            return true;
        }
        if (message.length == 0)
            return true;

        myMessages.push(message);

        while (true) {
            var match = message.match(/^\*([^ ]*) ?(.*)?/);
            if (!match)
                break;
            var local = true;
            var cmd = match[1];
            var arg = match[2];
            switch (cmd) {
            case "where":
                game.chat.addMessage(sprintf("%d %d %d", game.player.X, game.player.Y, game.player.Z));
                break;
            case "friend-add":
            case "friend-remove":
                game.network.send(cmd, {Name: arg});
                break;
            case "friend-list":
                game.network.send("friend-list", {}, function(data) {
                    if (!data.Friends)
                        game.chat.addMessage("No friends")
                    else
                        data.Friends.forEach(function(name) {
                            game.chat.addMessage(name);
                        });
                });
                break;
            case "add":
                if (Entity.templates[arg])
                    game.controller.creatingCursor(new Entity(0, arg));
                break;
            case "list":
                for (var i in Entity.templates) {
                    var t = Entity.templates[i];
                    if (t.Type.contains(arg)) {
                        game.chat.addMessage(t.Type);
                    }
                }
                break;
            case "get-translations":
                dict.getTranslations();
                break;
            default:
                local = false;
            }
            if (local) {
                e.target.value = "";
                return false;
            }
            break;
        }
        game.chat.send(message);
        e.target.value = "";
        return true;
    };

    this.channelGroupsElement = document.createElement("div");
    this.channelGroups = {};
    ["system", "players"].map(function(name) {
        var label = document.createElement("label");
        var channelGroup = document.createElement("input");
        channelGroup.type = "checkbox";
        channelGroup.checked = true;
        channelGroup.addEventListener("change", function(e) {
            self.messagesElement.classList[
                (this.checked) ? "remove" : "add"
            ]("channel-group-" + name)
        });
        label.appendChild(channelGroup);
        label.appendChild(document.createTextNode(T(name)));
        this.channelGroupsElement.appendChild(label);
        this.channelGroups[name] = true;
    }.bind(this));

    this.removeAlert = function() {
        game.controller.unhighlight("chat");
    },
    this.panel = new Panel(
        "chat",
        "Chat",
        [this.messagesElement, this.newMessageElement, this.channelGroupsElement]
    );

    this.panel.hooks.show = function() {
        this.initNotifications();
        this.newMessageElement.blur(); //fixes excape on empty input
        this.newMessageElement.focus();
        this.removeAlert();
    }.bind(this);

    this.names = {
        server: "[server]",
    };

    this.format = function(body) {
        var matches = body.match(/\${[^}]+}|https?:\/\/\S+|#\S+/g);
        var content = document.createElement("span");
        content.className = "body";
        if (matches) {
            matches.forEach(function(match) {
                body = parseMatch(content, body, match);
            });

            if (body.length)
                content.appendChild(document.createTextNode(body));
        } else {
            content.textContent = body;
        }
        return content;
    };

    function parseMatch (content, body, match) {
        var index = body.indexOf(match);
        if (index > 0) {
            var plain = body.substr(0, index);
            content.appendChild(document.createTextNode(plain));
        }

        var element = null;
        var simple = {type: "code", className: ""};

        switch(match) {
        case "${lmb}":
            simple.className = "lmb"
            break;
        case "${rmb}":
            simple.className = "rmb";
            break;
        case "${hr}":
            simple.type = "hr"
            break;
        default:
             element = parseComplexMatch(match);
        }

        if (!element) {
            element =  document.createElement(simple.type);
            element.className = simple.className;
        }
        content.appendChild(element);


        return body.substr(index + match.length);
    };

    var complexHandlers = {
        "https://": makeLinkParser("https"),
        "http://": makeLinkParser("http"),
        "recipe:": recipeParser,
    };

    function parseComplexMatch(match) {
        var startIndex = 0;
        var len = match.length;
        if (match[0] == "$") {
            startIndex = 2;
            len -= 3;
        }

        for(var prefix in complexHandlers) {
            var n = prefix.length;
            if (match.substr(startIndex, n) == prefix) {
                var data = match.substr(startIndex+n, len-n);
                return complexHandlers[prefix](data)
            }
        }
        var text = match.substr(startIndex, len);
        var common = document.createElement("code");
        common.textContent = T(text)
        return common;
    }

    function makeLinkParser(proto) {
        return function(data) {
            var url = proto + "://" + data;
            var link = document.createElement("a");
            link.target = "_blank";
            link.href = url;
            link.textContent = decodeURI(url)
            return link;
        }
    }

    function recipeParser(data) {
        var link = document.createElement("a");
        link.textContent = T("Recipe") + ": " + TS(data);
        link.className = "recipe-link";
        link.onclick = function() {
            game.controller.craft.panel.show();
            game.controller.craft.search(data, true);
        }
        return link;
    }

    var appendMessage = function(contents) {
        var messageElement = document.createElement("li");

        messageElement.classList.add("message");

        contents.map(function(element) {
            messageElement.appendChild(element);
        });

        var height = this.messagesElement.scrollTop + this.messagesElement.clientHeight;
        var scroll = (height == this.messagesElement.scrollHeight);
        this.messagesElement.appendChild(messageElement);
        if (scroll)
            this.messagesElement.scrollTop = this.messagesElement.scrollHeight;

        return messageElement;
    }.bind(this);


    this.addMessage = function(message) {
        if (typeof message == 'string') {
            message = {
                From: null,
                Channel: { Id: 7 },
                Body: message
            };
        }

        var sendNotification = !game.focus;
        var contents = [];

        this.addBallon(message);
        if (message.Channel) {
            switch(message.Channel.Id) {
            case 9: //local
                return;
            case 8:
                message.From = this.names.server;
                game.controller.showAnouncement(message.Body);
                break;
            }
        }

        if (message.From && message.Channel && message.Channel.Id != 6) {
            var fromElement = document.createElement("span");
            fromElement.className = "from";
            var color = null;
            switch(message.From) {
            case "TatriX":
                color = "#03c";
                break;
            case this.names.server:
                if (!message.Channel.Id)
                    message.Channel.Id = 7;
                color = "brown";
                break;
            default:
                if (message.IsNpc) {
                    color = "#939";
                    sendNotification = false;
                }
            }
            if (message.From) {
                if (color)
                    fromElement.style.color = color;
                fromElement.textContent = message.From + ": ";
                var now = new Date();
                fromElement.title = '[' + now.getHours() + ':' + now.getMinutes() + ']';
                contents.push(fromElement);
            }
        }

        contents.push(this.format(message.Body));

        var messageElement = appendMessage(contents);
        if (!message.From || message.From == game.player.Name) {
            messageElement.classList.add("from-me");
            sendNotification = false;
        }

        if (message.Channel)
            messageElement.classList.add("channel-" + message.Channel.Id);


        if (!sendNotification)
            return;

        game.sound.playSound("beep");

        var config = {
            icon : "assets/rogalik-64.png",
            tag: "chat-msg"
        }
        if (message.From != this.names.server || message.Body.search(/.* logged in/) == -1) {
            var subject = message.From;
            config.body = message.Body;
        } else {
            subject = message.Body
        }

        if (!this.useNotifications)
            return;

        var notification = new Notification(subject, config);
        notification.onclick = function() {
            this.panel.show();
            notification.close();
        }.bind(this);
    };

    this.sync = function(data) {
        var needAlert = false;
        for(var i = 0, l = data.length; i < l; i++) {
            this.addMessage(data[i]);
            if (data[i].From != game.player.Name) {
                if (data[i].Channel.Id != 9)
                    needAlert = true;
            }
        }
        if (needAlert)
            game.controller.highlight("chat");
    };


    this.addBallon = function(message) {
        var character = game.characters[message.From];
        if(!character)
            return;
        if (!game.player.see(character))
            return;

        if (character.ballon) {
            character.ballon.remove()
        }

        var ballon = document.createElement("div");
        character.ballon = ballon;

        ballon.remove = function() {
            ballon.parentNode.removeChild(ballon);
            character.ballon = null;
        };

        ballon.className = "ballon";
        var maxLen = 30;
        var text = message.Body.substr(0, maxLen).replace(/\${[^}]+}?/g, "[..]")
        if (text.length > maxLen)
            text += '...';
        ballon.textContent = text;

        util.dom.insert(ballon);
        var padding = (character.sprite.width - ballon.offsetWidth) / 2;

        ballon.update = function() {
            var p = character.screen();
            if (p.x < game.camera.x || p.x > game.screen.width + game.camera.x ||
                p.y < game.camera.y || p.y > game.screen.height + game.camera.y) {
                ballon.style.display = "none";
                return;
            }
            ballon.style.display = "block";
            ballon.style.left = padding + game.offset.x  - game.camera.x +
                p.x - character.sprite.width / 2 + "px";

            ballon.style.top = game.offset.y - game.camera.y +
                (p.y - 1.2 * character.sprite.nameOffset - ballon.offsetHeight) + "px";
        }
        ballon.update();

        setTimeout(function() {
            character.ballon && character.ballon.remove();
        }, 3000);
    };
}
