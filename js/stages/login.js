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
                Invite: invite,
            },
            function(data) {
                if ("Warning" in data) {
                    onWarning(data.Warning);
                } else {
                    game.setStage("lobby", data);
                }
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


    var loginLabel = document.createElement("label");
    loginLabel.textContent = T("Name");
    var loginInput = document.createElement("input");
    loginInput.value = game.login;
    loginLabel.appendChild(loginInput);

    var passwordLabel = document.createElement("label");
    passwordLabel.textContent = T("Password");
    var passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordLabel.appendChild(passwordInput);

    var loginButton = document.createElement("button");
    loginButton.textContent = T("Sign in");

    var registerButton = document.createElement("button");
    registerButton.textContent = T("Sign up");

    var repeatPasswordInput = document.createElement("input");
    repeatPasswordInput.type = "password";

    var repeatPasswordLabel = document.createElement("label");
    repeatPasswordLabel.textContent = T("Repeat password");
    repeatPasswordLabel.appendChild(repeatPasswordInput);
    util.dom.hide(repeatPasswordLabel);


    registerButton.onclick = function() {
        if (registering)
            return true;
        // invite = prompt("Enter code; To get code write at rogalik@tatrix.org");
        registering = true;

        util.dom.hide(loginButton);
        util.dom.show(repeatPasswordLabel);

        if (!loginInput.value)
            loginInput.focus();
        else if (!passwordInput.value)
            passwordInput.focus();
        else
            repeatPasswordInput.focus();

        return false;
    };

    var captchaDiv = document.createElement("div");
    "grecaptcha" in window && grecaptcha.render(captchaDiv, {
        "sitekey": "6LeWNP8SAAAAAAYxO-yCtxpHfwXtlOS2LDAXze-4",
        "callback": function(response) {
            captcha = response;
        }
    });

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

    form = document.createElement("form");
    form.id = "login-form";
    form.appendChild(loginLabel);
    form.appendChild(passwordLabel);
    form.appendChild(repeatPasswordLabel);
    form.appendChild(util.hr());
    form.appendChild(loginButton);
    form.appendChild(captchaDiv);
    form.appendChild(registerButton);
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
    var panel = new Panel("login-panel", "", [form]);
    panel.hideCloseButton();
    panel.show(LOBBY_X, LOBBY_Y);

    if (autoLogin)
        panel.hide();

    if (game.login)
        passwordInput.focus();
    else
        loginInput.focus();


    this.end = function() {
        panel.close();
    };
}
Stage.add(loginStage);
