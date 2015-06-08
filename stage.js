function Stage() {}

Stage.prototype = {
    name: "",
    start: function(){},
    end: function(){},
    update: function(){},
    draw: function(){},
    sync: function(data) {},
};

Stage.add = function(stage) {
    stage.prototype = Object.create(Stage.prototype);
};

function exitStage(message) {
    message = message || T("Refresh page...");
    game.ctx.fillStyle = "#fff";
    game.ctx.fillText(
        T(message),
        CELL_SIZE,
        CELL_SIZE
    );
    game.network.disconnect();

    var reload = document.createElement("button");
    reload.textContent = T("Reload");
    reload.onclick = game.reload;

    var help = document.createElement("p");
    help.id = "crash-help";

    var reset = document.createElement("button");
    reset.textContent = T("Reset settings");
    reset.addEventListener('click', game.controller.reset);
    document.body.appendChild(reset);

    help.appendChild(game.button.bugtracker());
    help.appendChild(game.button.vk());
    help.appendChild(reset);
    help.appendChild(game.button.logout());
    help.appendChild(reload);
    game.offset.world.appendChild(help);
};
Stage.add(exitStage);

function loadingStage(data) {
    game.addEventListeners();

    var forceUpdate = ("Version" in data);
    ["Version", "Recipes", "EntitiesTemplates"].forEach(function(key) {
        if (forceUpdate) {
            localStorage.setItem(key, JSON.stringify(data[key]));
        } else {
            data[key] = JSON.parse(localStorage.getItem(key));
        }
    });
    Character.skillLvls = data.SkillLvls;
    Character.initSprites();
    game.map.init(data.Bioms, data.Map);
    //for [*add item]
    Entity.init(data.EntitiesTemplates);
    Entity.recipes = data.Recipes;
    Entity.metaGroups = data.MetaGroups;
    game.initTime(data.Time, data.Tick);

    Info.prototype.damageTexture = loader.loadImage("damage.png");

    this.sync = function(data) {
        //TODO: don't send them!
        // ignore non init packets
        if (!("Location" in data))
            return;
        game.setTime(data.Time);
        loader.ready(function() {
            Entity.sync(data.Entities);
            Character.sync(data.Players);
            Character.sync(data.Mobs);
            Character.sync(data.NPCs);
            game.map.sync(data.Location);

            var wait = setInterval(function() {
                if (!game.map.ready)
                    return;
                var ready = game.entities.every(function(e) {
                    return e.sprite.ready;
                });

                if (!ready)
                    return;

                clearInterval(wait);
                game.setStage("main");

                game.controller.interfaceInit(data.Chat);

                game.controller.system.users.sync(data.PlayersOnline);
                game.controller.minimap.sync(data.PlayersOnline);
            }, 33);

            // if (!game.player.Settings.Premium) {
            //     game.ads.show();
            // }
        });
    };

    this.draw = function() {
        game.ctx.clear();
        game.ctx.fillStyle = "#333";
        game.ctx.fillText(
            game.loader.status,
            CELL_SIZE,
            CELL_SIZE
        );
    };
}
Stage.add(loadingStage);

function loginStage() {
    var signing = false;
    var registering = false;
    var autoLogin = false;
    var error = false;
    var captcha = null;
    var form = null;
    var invite = null;

    function onWarning(warning) {
        if (registering) {
            alert(warning);
        } else {
            localStorage.removeItem("password");
            if (!autoLogin)
                alert(warning);
            else
                util.dom.show(form);
            autoLogin = false;
        }
    }

    this.sync = function(data) {
        if ("Warning" in data) {
            onWarning(data.Warning);
        } else {
            this.sync = function(){};
            game.setStage("loading", data);
        }
    };

    function saveLogin() {
        localStorage.setItem("login", game.login);
    }

    function auth(cmd, password) {
        saveLogin();
        game.network.send(
            cmd,
            {
                Login: game.login,
                Password: password,
                Captcha: captcha,
                Version: game.version,
                Invite: invite,
            }
        );
    };

    var login = auth.bind(this, "login");
    var register = auth.bind(this, "register");


    game.login = localStorage.getItem("login");
    if (game.login == "-")
        game.login = "";
    var password = localStorage.getItem("password");
    if(game.login && password) {
        autoLogin = true;
        login(password);
    }

    form = document.createElement("form");
    form.className = "login-form";

    var loginLabel = document.createElement("label");
    loginLabel.textContent = T("Name");
    var loginInput = document.createElement("input");
    loginInput.value = game.login;
    loginLabel.appendChild(loginInput);
    form.appendChild(loginLabel);

    var passwordLabel = document.createElement("label");
    passwordLabel.textContent = T("Password");
    var passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordLabel.appendChild(passwordInput);
    form.appendChild(passwordLabel);

    var loginButton = document.createElement("button");
    loginButton.className = "btn";
    loginButton.textContent = T("Sign in");
    form.appendChild(loginButton);

    var hr = document.createElement("hr");
    form.appendChild(hr);

    var registerButton = document.createElement("button");
    registerButton.className = "btn btn-info";
    registerButton.textContent = T("Create character");

    var repeatPasswordInput = document.createElement("input");
    repeatPasswordInput.type = "password";

    registerButton.onclick = function() {
        if (registering)
            return true;
        // invite = prompt("Enter code; To get code write at rogalik@tatrix.org");
        registering = true;
        loginButton.style.display = "none";
        hr.style.display = "none";

        var repeatPasswordLabel = document.createElement("label");
        repeatPasswordLabel.textContent = T("Repeat password");
        repeatPasswordLabel.appendChild(repeatPasswordInput);

        form.insertBefore(repeatPasswordLabel, loginButton);

        if (!loginInput.value)
            loginInput.focus();
        else if (!passwordInput.value)
            passwordInput.focus();
        else
            repeatPasswordInput.focus();

        return false;
    };
    form.appendChild(registerButton);

    var captchaDiv = document.createElement("div");
    form.appendChild(captchaDiv);
    "grecaptcha" in window && grecaptcha.render(captchaDiv, {
        "sitekey": "6LeWNP8SAAAAAAYxO-yCtxpHfwXtlOS2LDAXze-4",
        "callback": function(response) {
            captcha = response;
        }
    });


    var vk = game.button.vk();
    vk.classList.add("button-link");
    var forum = game.button.forum();
    forum.classList.add("button-link");
    var blog = game.button.blog();
    blog.classList.add("button-link");

    var en = document.createElement("option");
    en.textContent = "en";
    var ru = document.createElement("option");
    ru.textContent = "ru";
    if (config.language.Russian)
        ru.selected = true;
    var lang = document.createElement("select");
    lang.id = "lang-selector";
    lang.appendChild(en);
    lang.appendChild(ru);
    lang.onchange = function() {
        localStorage.setItem("settings.language.Russian", (this.value == "ru"));
        game.reload();
    };

    form.appendChild(util.hr());
    form.appendChild(vk);
    form.appendChild(forum);
    form.appendChild(blog);

    form.appendChild(lang);

    form.onsubmit = function() {
        game.login = loginInput.value;
        var password = passwordInput.value;
        localStorage.setItem("password", password);
        if (!game.login || !password) {
            alert("You must provide login and password");
            return false;
        }
        if (registering) {
            if (repeatPasswordInput.value != passwordInput.value) {
                alert("Passwords doesn't match");
                return false;
            }
            register(password);
        } else {
            login(password);
        }

        return false;
    };

    if (autoLogin)
        util.dom.hide(form);

    game.world.appendChild(form);

    if (game.login)
        passwordInput.focus();
    else
        loginInput.focus();


    this.end = function() {
        util.dom.remove(form);
    };
}
Stage.add(loginStage);

function connectingStage() {
    game.ctx.fillStyle = "#fff";
    game.ctx.fillText("...", CELL_SIZE, CELL_SIZE);

    function run() {
        game.network.run();
        game.ctx.clear();
        game.ctx.fillText("Connecting...", CELL_SIZE, CELL_SIZE);
    }

    if (!window.WebFont) {
        run();
        return;
    }

    //Ubuntu
    //Anonymous Pro
    //Philosopher
    //Play
    //Bad+Script
    //Marck+Script
    //Ruslan+Display
    WebFont.load({
        google: {
            families: ["Philosopher::latin,cyrillic"]
        },
        active: function() {
            console.info("Fonts loaded");
            run();
        }
    });
}
Stage.add(connectingStage);

function mainStage() {
    this.sync = function (data) {
        if (data.Warning) {
            game.controller.showWarning(data.Warning);
            return;
        }
        if (data.Reconnect) {
            document.location.search = "?server=" + data.Reconnect;
            return;
        }
        Entity.sync(data.Entities || [], data.RemoveEntities || null);
        Character.sync(data.Players || [], data.RemovePlayers || null);
        Character.sync(data.Mobs || [], data.RemoveMobs || null);
        Character.sync(data.NPCs || [], data.RemoveNPCs || null);

        data.Location && game.map.sync(data.Location);

        if (data.PlayersOnline) {
            game.controller.system.users.sync(data.PlayersOnline);
            game.controller.minimap.sync(data.PlayersOnline);
        }

        game.controller.chat.sync(data.Chat || []);
        game.controller.skills.update();
        game.controller.fight.update();
        game.controller.craft.update();
        if (data.Players && game.player.Id in data.Players) {
            game.controller.stats.sync();
        }
    };

    var startTime = 0;
    this.update = function(currentTime) {
        currentTime = currentTime || Date.now();
        var ellapsedTime = currentTime - startTime;
        startTime = currentTime;
        game.epsilon = ellapsedTime / 1000;

        game.entities.forEach(function(e) {
            e.update(game.epsilon);
        });
        game.help.update();
        game.controller.update();
    };


    function drawObject(t) {
        t.draw();
    }
    function drawUI(t) {
        t.drawUI();
    }
    function drawClaim(t) {
        t.drawClaim();
    }

    var bugs = 0;
    // game.ctx.scale(0.3, 0.3);
    // game.ctx.translate(1000, 1000);

    this.draw = function() {
        game.ctx.globalCompositeOperation = "source-over";
        if ("MushroomTrip" in game.player.Effects) {
            if (--bugs > 0)
                game.ctx.globalCompositeOperation = "lighter";
            else if (Math.random() < 0.05)
                bugs = Math.random() * 10;
        }
        game.ctx.clear();
        game.ctx.save();
        game.ctx.translate(-game.camera.x, -game.camera.y);


        game.map.draw();

        game.claims.forEach(drawClaim);

        game.sortedEntities.traverse(drawObject);
        if (config.map.darkness)
            game.map.drawDarkness();

        game.sortedEntities.traverse(drawUI);

        game.controller.draw();
        // TODO: debug-remove
        // game.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        // game.ctx.fillRect(game.camera.x, game.camera.y, game.screen.width, game.screen.height);

        // TODO: debug-remove
        // if (game.network.astar) {
        //     game.network.astar.forEach(function(node) {
        //         if (node.Unpassable)
        //             return;
        //         game.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        //         game.iso.fillRect(node.X, node.Y, node.Width, node.Height);
        //             game.ctx.strokeStyle = "#333";
        //         game.iso.strokeRect(node.X, node.Y, node.Width, node.Height);
        //     });
        // }
        game.ctx.restore();
    };
    this.end = function() {};
}

Stage.add(mainStage);
