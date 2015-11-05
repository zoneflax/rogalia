"use strict";
function loginStage() {
    var signing = false;
    var registering = false;
    var autoLogin = false;
    var error = false;
    var captcha = null;
    var form = null;
    var invite = null;

    function register(password) {
        saveLogin();
        game.network.send(
            "register",
            {
                Login: game.login,
                Password: password,
                Captcha: captcha,
                Invite: invite,
                Referrer: document.referrer,
                UA: navigator.userAgent,
            },
            function(data) {
                if ("Warning" in data) {
                    alert(data.Warning);
                } else {
                    enterLobby(data);
                }
            }
        );
    };

    function enterLobby(data) {
        document.getElementById("version").textContent = data.Version;
        game.setStage("lobby", data);
    }

    function saveLogin() {
        localStorage.setItem("login", game.login);
    }

    function login(password) {
        saveLogin();
        game.network.send(
            "login",
            {
                Login: game.login,
                Password: password,
                Captcha: captcha,
            },
            function(data) {
                if ("Warning" in data) {
                    localStorage.removeItem("password");
                    if (!autoLogin)
                        alert(data.Warning);
                    panel.show();
                    autoLogin = false;
                } else {
                    enterLobby(data);
                }
            }
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
    panel.show(LOBBY_X + game.offset.x, LOBBY_Y + game.offset.y);

    if (game.login)
        passwordInput.focus();
    else
        loginInput.focus();

    function inVK() {
        return (window.name.indexOf('fXD') == 0);
    }

    if (inVK()) {
        panel.hide();
        var el = document.createElement("script");
        el.type = "text/javascript";
        el.src = "//vk.com/js/api/xd_connection.js?2";
        document.body.appendChild(el);
        el.onload = function() {
            VK.init(function() {
                var match = document.location.search.match(/access_token=(\w+)/);
                var token = match && match[1];
                if (token) {
                    panel.hide();
                    game.network.send("oauth", {Token: token}, enterLobby);
                } else {
                    panel.show();
                }
            }, function() {
                panel.show();
            }, '5.37');
        };
    }

    this.end = function() {
        panel.close();
    };
}
Stage.add(loginStage);
