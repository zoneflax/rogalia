function Stage() {}

Stage.prototype = {
    name: "",
    start: function(){},
    end: function(){},
    update: function(){},
    draw: function(){},
    sync: function(data) {},
}
Stage.add = function(stage) {
    stage.prototype = Object.create(Stage.prototype);
}


function exitStage(message) {
    message = message || T("Refresh page...");
    game.ctx.clear();
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

    var reset = document.createElement("button")
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
    //for $add
    Entity.init(data.EntitiesTemplates);
    Entity.recipes = data.Recipes;
    Entity.metaGroups = data.MetaGroups;
    game.initTime(data.Time, data.Tick);

    this.sync = function(data) {
        //TODO: don't send them!
        // ignore non init packets
        if (!("Location" in data))
            return;
        game.setTime(data.Time);
        loader.ready(function() {
            Entity.sync(data.Entities);
            Character.sync(data.Chars);
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

                game.controller.system.users.sync(data.CharsOnline);
                game.controller.minimap.sync(data.CharsOnline);
            }, 33);
        });
    }

    this.draw = function() {
        game.ctx.clear();
        game.ctx.fillStyle = "#fff";
        game.ctx.fillText(
            game.loader.status,
            CELL_SIZE,
            CELL_SIZE
        );
    }
}
Stage.add(loadingStage);

function loginStage() {
    var signing = false;
    var wrapper = null;
    var registering = false;
    var autoLogin = false;
    var error = false;
    var captcha = null;

    function warning(data) {
        if (data.Warning) {
            error = true;
            if (registering) {
                alert(data.Warning);
            } else {
                localStorage.removeItem("password");
                if (!autoLogin)
                    alert(data.Warning);
                else
                    wrapper.classList.remove("hidden");
                autoLogin = false;
            }
        }
    }

    this.sync = function(data) {
        if (!error) {
            this.sync = function(){};
            game.setStage("loading", data);
        }
    }

    function saveLogin() {
        localStorage.setItem("login", game.login);
    }

    function login(password) {
        error = false;
        saveLogin();
        game.network.send(
            "login",
            {
                Login: game.login,
                Password: password,
                Captcha: captcha,
                Version: game.version,
            },
            warning
        );
    };

    function register(password) {
        error = false;
        saveLogin();
        game.network.send(
            "register",
            {Login: game.login, Password: password},
            warning
        );
    };

    game.login = localStorage.getItem("login");
    if (game.login == "-")
        game.login = "";
    var password = localStorage.getItem("password");
    if(game.login && password) {
        autoLogin = true;
        login(password);
    }

    var form = document.createElement("form");
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
    passwordInput.autocomplete = "off";
    passwordInput.type = "password";
    passwordLabel.appendChild(passwordInput);
    form.appendChild(passwordLabel);


    var loginButton = document.createElement("button");
    loginButton.className = "btn";
    loginButton.textContent = T("Sign in");
    form.appendChild(loginButton);

    var hr = document.createElement("hr")
    form.appendChild(hr);

    var registerButton = document.createElement("button");
    registerButton.className = "btn btn-info";
    registerButton.textContent = T("Create character");

    var repeatPasswordInput = document.createElement("input");
    repeatPasswordInput.type = "password";

    registerButton.onclick = function() {
        if (registering)
            return true;
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
    var forum = game.button.forum()
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
    lang.id = "lang-selector"
    lang.appendChild(en);
    lang.appendChild(ru);
    lang.onchange = function() {
        localStorage.setItem("settings.language.Russian", (this.value == "ru"));
        game.reload();
    }

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

    var wrapper = document.createElement("div");
    wrapper.classList.add("login-form-wrapper");
    if (autoLogin)
        wrapper.classList.add("hidden")
    wrapper.appendChild(form);
    document.body.appendChild(wrapper);

    if (game.login)
        passwordInput.focus();
    else
        loginInput.focus();


    this.end = function() {
        if (wrapper) {
            wrapper.parentNode.removeChild(wrapper);
            wrapper = null;
        }
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

    WebFont.load({
        google: {
            families: ["Play::latin,cyrillic"]
        },
        active: function() {
            console.info("Fonts loaded");
            run();
        }
    });
}
Stage.add(connectingStage);

function mainStage() {
    game.sound.playMusic();

    this.sync = function (data) {
        if (data.Warning) {
            game.controller.showWarning(data.Warning);
            return
        }
        Entity.sync(data.Entities || [], data.RemoveEntities || null);
        Character.sync(data.Chars || [], data.RemoveChars || null);

        data.Location && game.map.sync(data.Location);

        if (data.CharsOnline) {
            game.controller.system.users.sync(data.CharsOnline);
            game.controller.minimap.sync(data.CharsOnline);
        }

        game.controller.chat.sync(data.Chat || []);
        game.controller.skills.update();
        game.controller.fight.update();
        game.controller.craft.update();
        if (data.Chars && game.player.Id in data.Chars) {
            game.controller.stats.sync();
        }
    }

    var startTime = 0;
    this.update = function(currentTime) {
        currentTime = currentTime || Date.now();
        var ellapsedTime = currentTime - startTime;
        startTime = currentTime;
        game.epsilon = ellapsedTime / 1000;

        game.entities.forEach(function(e) {
            e.update(game.epsilon);
        })
        game.help.update();
        game.controller.update();
    };


    function drawObject(t) {
        t.draw();
    }
    function drawUI(t) {
        t.drawUI()
    }
    var bugs = 0;
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

        game.sortedEntities.traverse(drawObject)
        if (config.map.darkness)
            game.map.drawDarkness();

        game.sortedEntities.traverse(drawUI)

        game.controller.draw();
        game.ctx.restore();
    };
    this.end = function() {

    }
}

Stage.add(mainStage);
