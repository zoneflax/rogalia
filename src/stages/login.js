/* global game, FormData, dom, Panel */

"use strict";

function loginStage() {
    var self = this;
    this.panel = null;

    if (fastLogin()) {
        return;
    }

    if (game.args["steam"]) {
        this.draw = Stage.makeEllipsisDrawer();
        steamLogin();
    } else if (game.inVK())
        vkLogin();
    else
        showLoginForm();

    function showLoginForm() {
        var login = dom.input(T("Login") + "/" + T("Email"), game.getLogin());

        var password = dom.input(T("Password"), "", "password");
        password.onkeydown = submitSignin;

        var email = dom.input(T("Email"));
        email.onkeydown = submitSignup;
        dom.hide(email.label);

        var signinButton = dom.button(T("Sign in"), "", submitSignin);
        var signupButton = dom.button(T("Sign up"), "", startSignup);

        var cancelSignupButton = dom.button(T("Cancel"), "", function() {
            password.onkeydown = submitSignin;
            dom.hide(cancelSignupButton);
            dom.hide(email.label);
            dom.show(signinButton);
            signupButton.onclick = startSignup;
            selectFocus();
        });
        dom.hide(cancelSignupButton);

        var form = dom.wrap("#login-form", [
            login.label,
            password.label,
            email.label,
            dom.hr(),
            signinButton,
            signupButton,
            cancelSignupButton,
        ]);

        self.panel = new Panel("login", "",  form)
            .hideCloseButton()
            .show()
            .center(0.5, 0.05);

        if (login.value)
            password.focus();
        else
            login.focus();

        function submitSignin(event) {
            if (event && event.keyCode && event.keyCode != 13)
                return;
            if (!validateLoginAndPassword())
                return;

            signin(login.value, password.value);
        }

        function submitSignup(event) {
            if (event && event.keyCode && event.keyCode != 13)
                return;

            if (!validateLoginAndPassword())
                return;
            if (!validate(email, "Please enter email"))
                return;

            signup(login.value, password.value, email.value);
        }

        function validateLoginAndPassword() {
            if (!validate(login, "Please enter login"))
                return false;
            if (!validate(password, "Please enter password"))
                return false;

            return true;
        }

        function selectFocus() {
            if (!login.value)
                login.focus();
            else if (!password.value)
                password.focus();
            else
                email.focus();
        }

        function startSignup() {
            if (document.location.host == "rogalia.ru") {
                document.location.href = "http://store.steampowered.com/app/528460/";
                return;
            }
            dom.show(email.label);
            dom.show(cancelSignupButton);
            dom.hide(signinButton);
            password.onkeydown = null;
            selectFocus();
            signupButton.onclick = submitSignup;
        }
    }

    function signin(login, password) {
        game.setLogin(login);
        game.clearServerInfo();

        var formData = new FormData();
        formData.append("login", login);
        formData.append("password", password);

        var req = new XMLHttpRequest();
        req.open("POST", game.gateway + "/login", true);
        req.onload = onload;
        req.onerror = onload;
        req.send(formData);
    }

    function fastLogin() {
        var server = game.loadServerInfo();
        var token = game.loadSessionToken();
        if (server && token) {
            connectAndLogin(server, token);
            return true;
        }
        if (token) {
            var formData = new FormData();
            formData.append("token", token);

            var req = new XMLHttpRequest();
            req.open("POST", game.gateway + "/token", true);
            req.onload = onload;
            req.onerror = onload;
            req.send(formData);

            return true;
        }
        return false;
    }

    function selectServer() {
        self.panel && self.panel.close();
        game.setStage("selectServer");
    }

    function connectAndLogin(server, token) {
        // TODO: remove fix
        if (!token) {
            this.clearSessionToken();
            return;
        }
        game.connectAndLogin(server, token);
        self.sync = openLobby;
        self.panel && self.panel.close();
        self.draw = Stage.makeEllipsisDrawer();
    }

    function openLobby(data) {
        if (data.Warning) {
            game.popup.alert(T(data.Warning));
            self.draw = function(){};
            game.clearSessionToken();
            showLoginForm();
            return;
        }
        self.panel && self.panel.close();
        game.setStage("lobby", data);
    }

    function signup(login, password, email) {
        game.setLogin(login);
        game.clearServerInfo();

        var formData = new FormData();
        formData.append("login", login);
        formData.append("password", password);
        formData.append("email", email);

        var req = new XMLHttpRequest();
        req.open("POST", game.gateway + "/register", true);
        req.send(formData);

        req.onload = onload;
        req.onerror = onload;
    }

    function validate(input, message) {
        if (input.value)
            return true;

        game.popup.alert(T(message), function() {
            input.focus();
        });

        return false;
    };


    function vkLogin() {
        self.draw = Stage.makeEllipsisDrawer();
        var script = util.loadScript("//vk.com/js/api/xd_connection.js?2", function() {
            VK.init(function() {
                VK.callMethod("showInstallBox");
                VK.addCallback("onApplicationAdded", function() {
                    var token = game.args["access_token"];
                    if (token) {
                        oauthLogin(token);
                    } else {
                        showLoginForm();
                    }
                });
            }, function() {
                showLoginForm();
            }, '5.37');
        });
        script.onerror = function() {
            game.popup.alert(T("Cannot connect to vk.com"));
            showLoginForm();
        };
    }

    function oauthLogin(token) {
        var formData = new FormData();
        formData.append("token", token);

        var req = new XMLHttpRequest();
        req.open("POST", game.gateway + "/oauth/vk", true);
        req.send(formData);

        req.onload = onload;
    }

    function steamLogin() {
        var greenworks = require("./lib/greenworks");
        if (!greenworks.initAPI()) {
            alert("Error on initializing Steam API.");
            return;
        }
        console.log("Steam API has been initalized.");
        greenworks.getAuthSessionTicket(
            function onSuccess(session) {
                var formData = new FormData();
                formData.append("ticket", session.ticket.toString("hex"));
                var req = new XMLHttpRequest();
                req.open("POST", game.gateway + "/oauth/steam", true);
                req.send(formData);

                req.onload = onload;
            },
            function onError(err) {
                alert(err);
            }
        );

    }

    function onload() {
        switch (this.status) {
        case 200:
            var token = JSON.parse(this.responseText).Token;
            game.setSessionToken(token);
            var server = game.loadServerInfo();
            if (server) {
                connectAndLogin(server, token);
            } else {
                selectServer();
            }
            break;
        case 202:
            game.popup.alert(T(this.response.trim()));
            game.clearSessionToken();
            showLoginForm();
            break;
        default:
            console.error(this.response);
            game.popup.alert(T("Cannot connect to server"));
            break;
        }
    }
}

Stage.add(loginStage);
