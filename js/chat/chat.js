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

    this.messagesElement = document.createElement("ul");
    this.messagesElement.className = "messages no-drag";


    //TODO: encapsulate
    var scrollIndicator = document.createElement("div");
    scrollIndicator.className = "scroll-indicator";

    var scrollbar = document.createElement("div");
    scrollbar.className = "scrollbar";
    scrollbar.appendChild(scrollIndicator);

    var scrollDy = parseInt(getComputedStyle(scrollbar).top);
    var scrollStep = 7;
    var updateScroll = function(e) {
        var el = this.messagesElement;
        el.scrollTop += scrollStep * e.deltaY;
        if (el.scrollHeight <= el.offsetHeight)
            return;
        scrollbar.style.display = "block";
        var height = el.offsetHeight;
        var sbh = height - scrollDy;
        scrollbar.style.height = sbh + "px"; //TODO: make once

        scrollIndicator.style.height = sbh * (height / el.scrollHeight) + "px";
        scrollIndicator.style.top = (sbh * el.scrollTop) / el.scrollHeight + "px";

        return false;
    }.bind(this)

    this.messagesElement.addEventListener("wheel", updateScroll);

    this.newMessageElement = document.createElement("input");
    this.newMessageElement.id = "new-message";

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

    var myMessages = new ChatRing();

    this.keydown = function(e) {
        var message = e.target.value;
        switch (e.keyCode) {
        case 38: //up
            myMessages.save(message);
            e.target.value = myMessages.prev();
            return true;
        case 40: //down
            e.target.value = myMessages.next();
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
                        game.chat.addMessage("No friends");
                    else
                        data.Friends.forEach(function(name) {
                            game.chat.addMessage(name);
                        });
                });
                break;
            case "add":
                if (Entity.templates[arg]) {
                    game.controller.creatingCursor(new Entity(0, arg));
                    e.target.blur();
                    break;
                }
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

    var semi = {
        focus: false,
        always: true,
    };

    var semihide = function() {
        if (!semi.focus && !semi.always)
            this.panel.contents.classList.add("semi-hidden");
    }.bind(this);
    var semishow = function() {
        this.panel.contents.classList.remove("semi-hidden");
    }.bind(this);

    this.removeAlert = function() {
        game.controller.unhighlight("chat");
    },

    this.attach = function() {
        var contents = this.panel.contents;
        contents.id = "attached-chat";
        util.dom.remove(contents);
        game.interface.appendChild(contents);
        util.dom.hide(this.panel.button);
        this.panel.hide();
        semihide();
    };

    this.detach = function() {
        var contents = this.panel.contents;
        contents.id = "";
        util.dom.remove(contents);
        this.panel.element.appendChild(contents);
        util.dom.show(this.panel.button);
    };

    this.tabs = document.createElement("div");
    this.tabs.id = "chat-tabs";

    var tabs = ["general", "friends", "system"];
    tabs.forEach(function(name, i) {
        var icon = new Image();
        icon.src = "assets/icons/chat/tab-" + name + ".png";
        icon.className = "chat-tab-icon";

        var title = document.createElement("span");
        title.textContent = T(name);

        var tab = document.createElement("div");
        tab.className = "chat-tab";
        tab.id = "chat-tab-" + name;
        tab.appendChild(icon);
        tab.appendChild(title);
        tab.style.zIndex = tabs.length - i;

        this.tabs.appendChild(tab);
    }.bind(this));
    this.tabs.firstChild.classList.add("active");

    var activeTab = {
        elem: this.tabs.firstChild,
        name: tabs[0],
    }


    //TODO: get rid of checkbox
    var alwaysVisible = util.dom.createCheckBox();
    alwaysVisible.id = "chat-always-visible";
    alwaysVisible.label.id = "chat-always-visible-label";
    alwaysVisible.label.title = T("Always visible");
    alwaysVisible.checked = localStorage.getItem("chat.alwaysVisible") == "true";
    alwaysVisible.onclick = function() {
        semi.always = !semi.always;
        localStorage.setItem("chat.alwaysVisible", semi.always);
        this.panel.contents.classList.toggle("semi-hidden");
    }.bind(this);

    var settingsIcon = new Image();
    settingsIcon.src = "assets/icons/chat/settings.png";
    settingsIcon.id = "chat-settings-icon";
    settingsIcon.onclick = function() {
        var name = document.createElement("div");
        name.textContent = activeTab.name;
        var checkboxes = document.createElement("div");
        ["system", "server", "players", "npc"].map(function(name) {
            var label = document.createElement("label");
            label.style.display = "block";
            var channelGroup = document.createElement("input");
            channelGroup.type = "checkbox";
            channelGroup.checked = true;
            channelGroup.addEventListener("change", function(e) {
                self.messagesElement.classList[
                    (this.checked) ? "remove" : "add"
                ]("channel-group-" + name);
            });
            label.appendChild(channelGroup);
            label.appendChild(document.createTextNode(T(name)));
            checkboxes.appendChild(label);
        });
        var save = document.createElement("button");
        save.textContent = T("Save");
        save.onclick = function() {
            alert("TODO");
        }
        var panel = new Panel("chat-settings", T("Tab settings"), [
            name,
            util.hr(),
            checkboxes,
            util.hr(),
            save
        ]);
        panel.show();
    };


    var tabContents = document.createElement("div");
    tabContents.id = "chat-tab-content";
    tabContents.appendChild(scrollbar);
    tabContents.appendChild(this.messagesElement);
    tabContents.appendChild(this.newMessageElement);
    tabContents.appendChild(settingsIcon);
    tabContents.appendChild(alwaysVisible.label);

    this.panel = new Panel(
        "chat",
        "Chat",
        [this.tabs, tabContents]
    );

    // hide on load
    if (!alwaysVisible.checked)
        alwaysVisible.onclick();

    this.panel.hooks.show = function() {
        this.initNotifications();
        this.newMessageElement.blur(); //fixes escape on empty input
        this.newMessageElement.focus();
        this.removeAlert();
    }.bind(this);

    this.newMessageElement.onfocus = function() {
        semi.focus = true;
        semishow();
    };
    this.newMessageElement.onblur = function() {
        semi.focus = false;
        semihide();
    };
    this.newMessageElement.onmouseenter = semishow;
    this.newMessageElement.onmouseleave = semihide;


    this.names = {
        server: "[server]",
    };

    this.format = function(body) {
        var matches = body.match(/\${[^}]+}|https?:\/\/\S+|#\S+|^>.*/g);
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
        var simple = {tag: "code", className: "", content: ""};

        switch(match) {
        case "${lmb}":
            simple.className = "lmb";
            break;
        case "${rmb}":
            simple.className = "rmb";
            break;
        case "${hr}":
            simple.tag = "hr";
            break;
        case "${triforce}":
            element = document.createElement("pre");
            element.style.lineHeight = 1;
            element.innerHTML = " ▲\n▲ ▲";
            break;
        default:
            switch (match[0]) {
            case ">":
                simple.tag = "quote";
                simple.content = match;
                break;
            default:
                element = parseComplexMatch(match);
            }
        }

        if (!element) {
            element =  document.createElement(simple.tag);
            element.className = simple.className;
            element.textContent = simple.content;
        }
        content.appendChild(element);

        return body.substr(index + match.length);
    };

    var complexHandlers = {
        "https://": makeLinkParser("https"),
        "http://": makeLinkParser("http"),
        "recipe:": recipeParser,
        "b:": makeTagParser("b"),
        "i:": makeTagParser("i"),
        "u:": makeTagParser("u"),
        "img:": imgParser,
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
                return complexHandlers[prefix](data);
            }
        }
        var text = match.substr(startIndex, len);
        var common = document.createElement("code");
        common.textContent = T(text);
        return common;
    }

    function makeLinkParser(proto) {
        return function(data) {
            var url = proto + "://" + data;
            var link = document.createElement("a");
            link.target = "_blank";
            link.href = url;
            link.textContent = decodeURI(url);
            return link;
        };
    }

    function makeTagParser(tag) {
        return function(data) {
            var elem = document.createElement(tag);
            elem.textContent = data;
            return elem;
        };
    }

    function recipeParser(data) {
        var link = document.createElement("a");
        link.textContent = T("Recipe") + ": " + TS(data);
        link.className = "recipe-link";
        link.onclick = function() {
            game.controller.craft.panel.show();
            game.controller.craft.search(data, true);
        };
        return link;
    }

    function imgParser(data) {
        var img = Entity.getPreview(data);
        img.className = "";
        var title = T(data);

        var code = document.createElement("code");
        code.textContent = title;


        var cnt = document.createElement("span");
        cnt.appendChild(code);
        if (img.width) {
            cnt.appendChild(img);
        }

        return cnt;
    };

    var appendMessage = function(contents) {
        var messageElement = document.createElement("li");

        messageElement.classList.add("message");

        contents.map(function(element) {
            messageElement.appendChild(element);
        });

        var height = this.messagesElement.scrollTop + this.messagesElement.clientHeight;
        var scroll = Math.abs(height - this.messagesElement.scrollHeight) < 10;
        this.messagesElement.appendChild(messageElement);
        if (scroll)
            this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
        updateScroll({deltaY: 99999});

        return messageElement;
    }.bind(this);


    this.append = function(text) {
        this.newMessageElement.value += text;
    };

    this.addMessage = function(message) {
        if (typeof message == 'string') {
            message = {
                From: null,
                Channel: 7,
                Body: message
            };
        }

        var sendNotification = !game.focus;
        var contents = [];

        this.addBallon(message);
        switch(message.Channel) {
        case 8:
            message.From = this.names.server;
            game.controller.showAnouncement(message.Body);
            break;
        }

        if (message.From && message.Channel != 6) {
            var fromElement = document.createElement("span");
            fromElement.className = "from";
            var color = null;
            switch(message.From) {
            case "Benedict":
                color = "#922";
                break;
            case "TatriX":
                color = "#0cc";
                break;
            case this.names.server:
                color = "yellow";
                break;
            default:
                if (message.Channel == 9) {
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
            messageElement.classList.add("channel-" + message.Channel);


        if (!sendNotification)
            return;

        game.sound.playSound("beep");

        var config = {
            icon : "assets/rogalik-64.png",
            tag: "chat-msg"
        };
        if (message.From != this.names.server || message.Body.search(/.* logged in/) == -1) {
            var subject = message.From;
            config.body = message.Body;
        } else {
            subject = message.Body;
        }

        if (!this.useNotifications)
            return;

        var notification = new Notification(subject, config);
        notification.onclick = function() {
            if (!config.ui.chatAttached)
                this.panel.show();
            notification.close();
        }.bind(this);
    };

    this.sync = function(data) {
        var needAlert = false;
        for(var i = 0, l = data.length; i < l; i++) {
            this.addMessage(data[i]);
            if (data[i].From != game.player.Name) {
                if (data[i].Channel != 9)
                    needAlert = true;
            }
        }
        if (needAlert)
            game.controller.highlight("chat");
    };


    this.addBallon = function(message) {
        var character = game.characters.get(message.From);
        if(!character)
            return;
        if (!game.player.see(character))
            return;

        if (character.ballon) {
            character.ballon.remove();
        }

        var ballon = document.createElement("div");
        character.ballon = ballon;

        ballon.remove = function() {
            ballon.parentNode.removeChild(ballon);
            character.ballon = null;
        };

        ballon.className = "ballon";
        var maxLen = 30;
        var text = message.Body.substr(0, maxLen).replace(/\${[^}]+}?/g, "[..]");
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
        };
        ballon.update();

        setTimeout(function() {
            character.ballon && character.ballon.remove();
        }, 3000);
    };

    this.activate = function() {
        if (config.ui.chatAttached)
            this.newMessageElement.focus();
        else
            this.panel.show();
    };
}
