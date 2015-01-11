function Game() {
    window.game = this;

    this.screen = {
        width: 1024,
        height: 768,
    };
    this.screen.cells_x = this.screen.width / CELL_SIZE;
    this.screen.cells_y = this.screen.height / CELL_SIZE;

    this.world = document.getElementById("world");
    this.world.style.width = this.screen.width + "px";
    this.world.style.height = this.screen.height + "px";

    this.canvas = document.getElementById("canvas");
    this.canvas.width = this.screen.width;
    this.canvas.height = this.screen.height;

    this.ctx = canvas.getContext("2d");
    this.ctx.clear = function() {
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    }
    this.setFontSize = function(size) {
        this.ctx.font = (size || FONT_SIZE) + "px Play, sans-serif";
    }
    this.setFontSize();

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
        game.time = time;
        var hours = Math.floor(time / 60);
        var minutes = time % 60;
        if (minutes < 10)
            minutes = '0' + minutes;
        this.timeElement.textContent = hours + ":" + minutes;
    };

    this.debug = debug;
    delete window[debug];

    this.config = config;
    delete window[config];

    Settings.load();
    dict.init();

    this.talks = new Talks();
    this.sound = new Sound();

    this.offset = {
        world: this.world,
        get x() { return this.world.offsetLeft; },
        get y() { return this.world.offsetTop; },
    };

    this.loader = new Loader("assets/");
    window.loader = this.loader;

    this.menu = new Menu(
        this.offset.x + CELL_SIZE / 2,
        this.offset.y
    );

    this.login = null;
    this.player = new Character();

    this.map = new Map();

    this.controller = new Controller(this);
    this.network = new Network();

    this.entities = new HashTable();
    this.sortedEntities = new BinarySearchTree();
    this.characters = {};
    this.containers = {}; //html interface for containers
    this.vendors = {};

    this.panels = {};
    this.epsilon = 0; // коэфицент для смены кадров
    this.camera = new Camera();

    this.drawStrokedText = function(text, x, y, strokeStyle) {
        if (game.config.ui.simpleFonts) {
            game.ctx.fillText(text, x, y);
            return;
        }
        var lineJoin = game.ctx.lineJoin;
        game.ctx.strokeStyle = strokeStyle || "#333";
        game.ctx.lineWidth = 4;
        game.ctx.lineJoin = 'round';
        game.ctx.strokeText(text, x, y);
        game.ctx.fillText(text, x, y);
        game.ctx.lineWidth = 1;
        game.ctx.lineJoin = lineJoin;
    };

    this.createPrice = function(cost) {
        var s = cost % 100;
        cost -= s;
        cost /= 100;
        var g = cost % 100;
        cost -= g;
        cost /= 100;
        var p = cost;

        var silver = document.createElement("span");
        silver.className = "silver";
        silver.textContent = s + "s";
        silver.title = T("Silver");

        var gold = document.createElement("span");
        gold.className = "gold";
        gold.textContent = g + "g";
        gold.title = T("Gold");

        var platinum = document.createElement("span");
        platinum.className = "platinum";
        platinum.textContent = p + "p";
        platinum.title = T("Platinum");

        var price = document.createElement("span");
        price.className = "price";
        price.appendChild(platinum);
        price.appendChild(gold);
        price.appendChild(silver);
        return price;
    };

    this.iso = new function() {
        var k = Math.sqrt(2);

        function draw(x, y, callback) {
            var p = new Point(x, y).toScreen();
            game.ctx.save();
            game.ctx.lineWidth = 2;
            game.ctx.translate(p.x, p.y);
            game.ctx.scale(1, 0.5);
            game.ctx.rotate(Math.PI / 4);
            callback()
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
            })
        };
        this.fillCircle = function(x, y, r) {
            draw(x, y, function() {
                game.ctx.beginPath();
                game.ctx.arc(0, 0, r * k, 0, Math.PI * 2);
                game.ctx.fill();
            })
        };
        this.strokeCircle = function(x, y, r) {
            draw(x, y, function() {
                game.ctx.beginPath();
                game.ctx.arc(0, 0, r * k, 0, Math.PI * 2);
                game.ctx.stroke();
            })
        };
    }

    this.addEventListeners = function() {
        window.addEventListener("beforeunload", function(e) {
            for(var panel in game.panels) {
                game.panels[panel].savePosition();
            }
            if (game.help)
                game.help.save();
            if (config.system.quitConfirm && game.stage.name != "exit") {
                e.preventDefault();
                return T("Quit?");
            }
            return null;
        });

        window.addEventListener('focus', function() {
            game.focus = true;
        });

        window.addEventListener('blur', function() {
            game.focus = false
        });

    }

    this.update = function(currentTime) {
        this.stage.update(currentTime);
    };

    this.draw = function() {
        this.stage.draw();
    };

    this.setStage = function(name, params) {
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

    this.logout = function() {
        localStorage.setItem("login", "-");
        localStorage.removeItem("password");
        game.reload();
    };

    this.addCharacter = function(character) {
        this.characters[character.Name] = character;
        this.addEntity(character);
    }

    this.filter = function(type) {
        var Class = window[type];
        return this.entities.filter(function(e) {
            return e instanceof Class;
        })
    }

    this.addEntity = function(entity) {
        this.entities.set(entity.Id, entity);
    }

    this.removeEntityById = function(id) {
        if (game.containers[id]) {
            game.containers[id].panel.hide();
            delete game.containers[id];
        }

        game.sortedEntities.remove(game.entities.get(id));
        game.map.removeObject(id);
        game.entities.delete(id);
    }

    this.removeCharacterById = function(id) {
        game.map.removeObject(id);
        var c = game.entities.get(id);
        game.sortedEntities.remove(c);
        var name = c.Name;
        game.entities.delete(id);
        delete game.characters[name];
    }

    this.findItemsNear = function(x, y, dist) {
        dist = dist || CELL_SIZE*2;
        return this.entities.filter(function(e) {
            return "inContainer" in e &&
                !e.inContainer() &&
                util.distanceLessThan(e.X - x, e.Y - y, dist);
        });
    }

    this.exit = function(message) {
        this.setStage("exit", message);
    };

    this.sendError = function(msg) {
        game.network.send("error", {msg: msg})
    }

    function openLink(link) {
        return function() {
            window.open(link, "_blank");
            return false;
        }

    }

    this.button = {
        blog: function() {
            var link = document.createElement("button");
            link.textContent = T("Blog");
            link.onclick = openLink("//tatrix.org");
            return link;
        },
        vk: function() {
            var vk = document.createElement("button");
            var vkLogo = document.createElement("img");
            vkLogo.src = "//vk.com/favicon.ico";
            vk.appendChild(vkLogo);
            vk.appendChild(document.createTextNode(T("Group")));
            vk.onclick = openLink("//vk.com/rogalik_mmo");
            return vk;
        },
        wiki: function() {
            var wiki = document.createElement("button");
            wiki.textContent = T("Wiki / FAQ");
            wiki.onclick = openLink("wiki/");
            return wiki;
        },
        forum: function() {
            var forum = document.createElement("button");
            forum.textContent = T("Forum");
            forum.onclick = openLink("forum/");
            return forum;
        },
        bugtracker: function() {
            var bugtracker = document.createElement("button");
            bugtracker.textContent = T("Bugtracker")
            bugtracker.onclick = openLink("/wiki/index.php/Bugtracker");
            return bugtracker;
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
                ["Animation", "igorekv", "http://vk.com/igorekv"],
                ["Music", "Иван Кельт", "http://vk.com/icelt"],

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
            }
            return authors;
        },
    }

    this.error = function() {
        console.error.apply(console, arguments);
        console.trace();
        game.sendError("Game error:|" + [].join.call(arguments, "|"))
        game.exit();
        throw "Fatal error";
    };

    this.stage = new Stage();
    this.setStage("connecting");

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
    }

    function tick(currentTime) {
        game.controller.fpsStatsBegin();

        game.update(currentTime);
        game.draw();

        game.controller.fpsStatsEnd();

        requestAnimationFrame(tick);
    };

    tick();
};
