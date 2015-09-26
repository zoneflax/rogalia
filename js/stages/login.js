"use strict";
function loginStage() {
    var signing = false;
    var registering = false;
    var autoLogin = false;
    var error = false;
    var captcha = null;
    var form = null;
    var invite = null;

    // document.location = "https://oauth.vk.com/authorize?" + [
    //     "client_id=4538094",
    //     "scope=0",
    //     "redirect_uri=http://rogalik.tatrix.org",
    //     "display=page",
    //     "response_type=token"
    // ].join("&");
    // VK.init(function() {
    //     console.log(VK.callMethod("showInviteBox"));
    //     // API initialization succeeded
    //     // Your code here
    // }, function() {
    //     alert("vk init Failure");
    //     // API initialization failed
    //     // Can reload page here
    // }, '5.34');
    // VK.init({apiId: 5002676})
    // function authInfo(response) {
    //     if (response.session) {
    //         var sid = document.cookie.match(/vk_app_5002676=([^;]*)/)[0]
    //         console.log(response.session);
    //         util.ajax("test.php", function(data) {
    //             console.log("ajax", data);
    //         })
    //     } else {
    //         var vkButton = document.createElement("div");
    //         vkButton.id = "vk-button";
    //         util.dom.insert(vkButton);
    //         VK.UI.button("vk-button");
    //         vkButton.onclick = function() {
    //             VK.Auth.login(function(response) {
    //                 console.log(response);
    //                 if (response.session) {
    //                     /* Пользователь успешно авторизовался */
    //                     if (response.settings) {
    //                         /* Выбранные настройки доступа пользователя, если они были запрошены */
    //                     }
    //                 } else {
    //                     /* Пользователь нажал кнопку Отмена в окне авторизации */
    //                 }
    //             });
    //         }
    //     }
    // }
    // VK.Auth.getLoginStatus(authInfo);

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
                    else
                        util.dom.show(form);
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
