"use strict";
function Game(lang) {
    window.game = this;

    this.lang = lang;
    this.world = document.getElementById("world");
    this.interface = document.getElementById("interface");
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.clear = function() {
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    };
    this.setFontSize = function(size) {
        this.ctx.font = (size || FONT_SIZE) + "px Dejavu Sans";
    };
    this.setFontSize();

    this.gateway = (function() {
        var match = document.location.search.match(/[?&"]gateway=([^&]+)/);
        return (match)
            ? "//" + match[1] + "/gateway"
            : "//rogalik.tatrix.org/gateway";
    })();

    Settings.load(config);

    new DragManager();

    this.screen = {
        width: 0,
        height: 0,
        cells_x: 0,
        cells_y: 0,
        update: function() {
            if (config.graphics.fullscreen) {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
            } else {
                this.width = (window.innerWidth > DEFAULT_CLIENT_WIDTH) ?
                    DEFAULT_CLIENT_WIDTH : window.innerWidth;
                this.height = (window.innerHeight > DEFAULT_CLIENT_HEIGHT) ?
                    DEFAULT_CLIENT_HEIGHT : window.innerHeight;
            }

            this.cells_x = this.width / CELL_SIZE;
            this.cells_y = this.height / CELL_SIZE;
            game.canvas.width = this.width;
            game.canvas.height = this.height;
            game.world.style.width = this.width + "px";
            game.world.style.height = this.height + "px";
            game.setFontSize();
        },
    };

    this.ping = 0;
    this.time = 0;
    this.timeElement = document.getElementById("time");

    this.initTime = function(time, tick) {
        this.setTime(time);
        setInterval(function() {
            if (++time > 1440)
                time = 0;

            game.setTime(time);
        }, tick);
    };

    this.setTime = function(time) {
        if (!time)
            return;
        game.time = time;
        this.timeElement.textContent = util.formatTime(time);
    };

    this.debug = debug;
    this.config = config;
    this.sound = new Sound();

    this.offset = {
        get x() { return game.world.offsetLeft; },
        get y() { return game.world.offsetTop; },
    };

    this.loader = new Loader("assets/");
    window.loader = this.loader;

    this.menu = new Menu();

    this.oauthToken = null;
    this.login = null;
    this.player = null;
    this.playerName = "";

    this.map = new WorldMap();

    this.controller = new Controller(this);
    this.network = new Network();

    this.entities = new HashTable();
    this.sortedEntities = new BinarySearchTree();
    this.claims = new HashTable();
    this.characters = new HashTable();
    this.missiles = [];
    this.containers = {};
    this.vendors = {};

    this.quests = new Quests();
    this.panels = {};
    this.epsilon = 0;
    this.camera = new Point();

    this.drawStrokedText = function(text, x, y, strokeStyle) {
        if (game.config.ui.simpleFonts) {
            game.ctx.fillText(text, x, y);
            return;
        }
        this.forceDrawStrokedText(text, x, y, strokeStyle);
    };

    this.forceDrawStrokedText = function(text, x, y, strokeStyle) {
        var lineJoin = game.ctx.lineJoin;
        game.ctx.strokeStyle = strokeStyle || "#292b2f";
        game.ctx.lineWidth = 2.5;
        game.ctx.lineJoin = "round";
        game.ctx.strokeText(text, x, y);
        game.ctx.fillText(text, x, y);
        game.ctx.lineWidth = 1;
        game.ctx.lineJoin = lineJoin;
    };

    this.iso = new function() {
        var k = Math.sqrt(2);

        function draw(x, y, callback) {
            var p = new Point(x, y).toScreen();
            game.ctx.save();
            if (game.ctx.lineWidth < 2)
                game.ctx.lineWidth = 2;
            game.ctx.translate(p.x, p.y);
            game.ctx.scale(1, 0.5);
            game.ctx.rotate(Math.PI / 4);
            callback();
            game.ctx.restore();
        }
        this.strokeRect = function(x, y, w, h) {
            draw(x, y, function() {
                game.ctx.strokeRect(0, 0, w * k, h * k);
            });
        };
        this.fillRect = function(x, y, w, h) {
            draw(x, y, function() {
                game.ctx.fillRect(0, 0, w * k, h * k);
            });
        };
        this.fillCircle = function(x, y, r) {
            draw(x, y, function() {
                game.ctx.beginPath();
                game.ctx.arc(0, 0, r * k, 0, Math.PI * 2);
                game.ctx.fill();
            });
        };
        this.strokeCircle = function(x, y, r) {
            draw(x, y, function() {
                game.ctx.beginPath();
                game.ctx.arc(0, 0, r * k, 0, Math.PI * 2);
                game.ctx.stroke();
            });
        };
        this.fillStrokedCircle = function(x, y, r) {
            this.fillCircle(x, y, r);
            this.strokeCircle(x, y, r);
        };
        this.fillStrokedRect = function(x, y, w, h) {
            this.fillRect(x, y, w, h);
            this.strokeRect(x, y, w, h);
        };
    };

    this.save = function() {
        // on exit stage all panels are hidden
        // so they have nulled coordinates
        // and thus we shouldn't save them
        if (game.stage.name == "exit")
            return;
        Panel.save();
        Container.save();
        game.controller.craft && game.controller.craft.save();
        game.chat && game.chat.save();
        game.controller.minimap && game.controller.minimap.save();
    };

    this.addEventListeners = function() {
        window.addEventListener("resize", game.screen.update.bind(game.screen));
        window.addEventListener("beforeunload", function(e) {
            game.save();
        });

        window.addEventListener('focus', function() {
            game.focus = true;
        });

        window.addEventListener('blur', function() {
            game.focus = false;
        });

    };

    this.update = function(currentTime) {
        this.stage.update(currentTime);
    };

    this.draw = function() {
        this.stage.draw();
    };

    this.setStage = function(name, params) {
        this.screen.update();
        document.body.classList.remove(this.stage.name + "-stage");
        this.stage.end();
        game.ctx.clear();
        this.stage = new window[name + "Stage"](params);
        this.stage.name = name;
        document.body.classList.add(name + "-stage");
    };

    this.reload = function() {
        document.location.reload();
    };

    this.loadLogin = function() {
        this.login = localStorage.getItem("login");
        return this.login;
    };

    this.setLogin = function(login) {
        localStorage.setItem("login", login);
        this.login = login;
    };

    this.loadServerInfo = function() {
        var server = localStorage.getItem("server");
        return server && JSON.parse(server);
    };

    this.setServerInfo = function(server) {
        localStorage.setItem("server", JSON.stringify(server));
    };

    this.clearLogin = function() {
        localStorage.removeItem("login");
    };

    this.loadPassword = function() {
        return localStorage.getItem("password");
    };

    this.setPassword = function(password) {
        localStorage.setItem("password", password);
    };

    this.clearPassword = function() {
        localStorage.removeItem("password");
    };

    this.clearServerInfo = function() {
        localStorage.removeItem("server");
    };

    this.clearCredentials = function() {
        this.clearServerInfo();
        this.clearLogin();
        this.clearPassword();
    };

    this.connectAndLogin = function(server) {
        this.setServerInfo(server);
        document.getElementById("server-addr").textContent = server.Name;

        var self = this;
        this.network.run(server.Addr, this.oauthToken ? oauth : login);

        function oauth() {
            self.network.send("oauth", { Token: self.oauthToken });
        }

        function login() {
            self.network.send("login", { Login: self.login, Password: self.loadPassword() });
        }
    };

    this.logout = function() {
        this.clearCredentials();
        this.reload();
    }.bind(this);

    this.addCharacter = function(character) {
        this.addEntity(character);

        this.characters.set(character.name || character.Id, character);

        if (character.Name == game.playerName) {
            character.isPlayer = true;;
            game.player = character;
        }
    };

    this.addEntity = function(entity) {
        this.entities.set(entity.Id, entity);
        if (entity.Group == "claim")
            this.claims.set(entity.Id, entity);
    };

    this.removeEntityById = function(id) {
        if (game.containers[id]) {
            game.containers[id].panel.hide();
            delete game.containers[id];
        }

        var entity = Entity.get(id);
        entity.onremove();
        game.sortedEntities.remove(entity);
        game.entities.remove(id);
        game.claims.remove(id);
    };

    this.removeCharacterById = function(id) {
        var c = game.entities.get(id);
        game.sortedEntities.remove(c);
        var name = c.name || c.Id;
        game.entities.remove(id);
        game.characters.remove(name);
    };

    this.findItemsNear = function(x, y, dist) {
        dist = dist || CELL_SIZE*2;
        return this.entities.filter(function(e) {
            return "inWorld" in e &&
                e.inWorld() &&
                util.distanceLessThan(e.X - x, e.Y - y, dist);
        });
    };

    this.findCharsNear = function(x, y, dist) {
        dist = dist || CELL_SIZE*2;
        return this.characters.filter(function(e) {
            return util.distanceLessThan(e.X - x, e.Y - y, dist);
        });
    };

    this.exit = function(message) {
        this.save();
        this.setStage("exit", message);
    };

    var popup = new Popup();
    this.alert = popup.alert;
    this.confirm = popup.confirm;
    this.prompt = popup.prompt;

    this.sendError = function(msg) {
        game.network.send("error", {msg: msg});
    };

    this.sendErrorf = function() {
        this.sendError(sprintf.apply(window, arguments));
    };

    this.inVK = function() {
        return (window.name.indexOf('fXD') == 0);
    };

    var siteUrl = "http://rogalia.ru";
    function openLink(link) {
        if (link.charAt(0) == "$")
            link = siteUrl + link.substring(1);
        return function() {
            window.open(link, "_blank");
            return false;
        };
    }

    this.button = {
        donate: function() {
            var link = document.createElement("button");
            link.textContent = T("Donate");
            link.onclick = openLink("http://rogalia.ru/shop/donate");
            return link;
        },
        blog: function() {
            var link = document.createElement("button");
            link.textContent = T("Blog");
            link.onclick = openLink("http://tatrix.org");
            return link;
        },
        vk: function() {
            var vk = document.createElement("button");
            var vkLogo = document.createElement("img");
            vkLogo.src = "//vk.com/favicon.ico";
            vk.appendChild(vkLogo);
            vk.appendChild(document.createTextNode(T("Group")));
            vk.onclick = openLink("//vk.com/rogalia");
            return vk;
        },
        twitter: function() {
            var twitter = document.createElement("button");
            var twitterLogo = document.createElement("img");
            twitterLogo.src = "//twitter.com/favicon.ico";
            twitter.appendChild(twitterLogo);
            twitter.appendChild(document.createTextNode(T("Twitter")));
            twitter.onclick = openLink("//twitter.com/Tatrics");
            return twitter;
        },
        wiki: function() {
            var wiki = document.createElement("button");
            wiki.textContent = T("Wiki / FAQ");
            wiki.onclick = openLink("$/wiki/");
            return wiki;
        },
        forum: function() {
            var forum = document.createElement("button");
            forum.textContent = T("Forum");
            forum.onclick = openLink("$/forum/");
            return forum;
        },
        lobby: function() {
            var lobby = document.createElement("button");
            lobby.textContent = T("Change character");
            lobby.onclick = function() {
                game.reload(); //TODO: we should not reload
            };
            return lobby;
        },
        logout: function() {
            var logout = document.createElement("button");
            logout.textContent = T("Logout");
            logout.onclick = game.logout;
            return logout;
        },
        authors: function() {
            var authors = document.createElement("button");
            authors.textContent = T("Authors");

            var links = [
                ["Code", "TatriX", "http://vk.com/tatrix"],
                ["Graphics", "Nanalli", "http://vk.com/id325294403"],
                // ["Music", "Иван Кельт", "http://vk.com/icelt"],

            ].map(function(tuple) {
                var title = document.createElement("cite");
                title.textContent = tuple[0];

                var link = document.createElement("a");
                link.innerHTML = tuple[1];
                link.href = tuple[2];
                link.target = "_blank";

                var label = document.createElement("div");
                label.appendChild(title);
                label.appendChild(link);

                return label;
            });

            var p = new Panel("authors",  "authors", links);
            authors.onclick = function() {
                p.show();
            };
            return authors;
        },
    };

    this.error = function() {
        this.sendErrorf.apply(this, arguments);
        this.exit();
        throw "Fatal error";
    };

    this.jukebox = new function() {
        this.iframe = dom.tag("iframe");
        this.panel = new Panel("jukebox", "Jukebox", [this.iframe]);
        this.panel.temporary = true;

        var videoRegexp = new RegExp(/^[A-Za-z0-9_-]{11}$/);
        var current = {
            video: "",
            time: 0,
        };

        this.play = function(video, time) {
            if (!videoRegexp.test(video)) {
                this.stop();
                return;
            }
            current.video = video;
            current.time = time;
            if (!config.sound.jukebox)
                return;
            game.sound.stopMusic();

            var src = "http://www.youtube.com/embed/" + video + "?autoplay=1";
            if (time)
                src += "&start=" + time;
            this.iframe.src = src;
        };

        this.stop = function() {
            this.iframe.src = "";
        };

        this.toggle = function() {
            if (config.sound.jukebox) {
                this.play(current.video, current.time);
            } else {
                this.stop();
            }
        };

        this.open = function() {
            this.panel.show();
        }.bind(this);
    };

    var maximize = document.getElementById("maximize");
    maximize.onclick = function() {
        maximize.classList.toggle("maximized");
        util.toggleFullscreen();
    };

    this.stage = new Stage();
    this.setStage("login");


    window.onerror = function(msg, url, line) {
        window.onerror = null;
        game.sendError([
            "Client error:",
            msg,
            "Url: " + url,
            "Line: " + line,
            "UA: " + navigator.userAgent,
        ].join("|"));
        game.exit(T("Client error. Refresh page or try again later."));
        return false;
    };

    function loadLess() {
        window.less = {
            env: "development",
            useFileCache: false,
        };

        util.loadScript("//cdnjs.cloudflare.com/ajax/libs/less.js/2.7.1/less.min.js").onload = function() {
            var link = dom.tag("link");
            link.rel = "stylesheet/less";
            link.href = "main.less";
            dom.insert(link, document.head);
            less.sheets.push(link);
            less.refresh();
        };
    }

    function tick(currentTime) {
        game.controller.fpsStatsBegin();

        game.update(currentTime);
        game.draw();

        game.controller.fpsStatsEnd();

        requestAnimationFrame(tick);
    };

    if (document.location.href.match("localhost")) {
        loadLess();
    }

    T.update();
    tick();
};
