"use strict";

function loginStage() {
    var self = this;
    this.panel = null;

    if (game.inVK())
        vkLogin();
    else
        showLoginForm();

    function showLoginForm() {
        var login = dom.input(T("Login"), game.loadLogin());

        var password = dom.input(T("Password"), game.loadPassword(), "password");
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

        self.panel = new Panel("login", "", [form])
            .hideCloseButton()
            .show(LOBBY_X + game.offset.x, LOBBY_Y + game.offset.y);

        if (login.value && password.value)
            submitSignin();
        else if (login.value)
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

        var formData = new FormData();
        formData.append("login", login);
        formData.append("password", password);

        var req = new XMLHttpRequest();
        req.open("POST", game.gateway + "/login", true);
        req.send(formData);

        req.onload = makeResponseHandler(function() {
            game.setPassword(password);
            fastLogin();
        });
    }

    function fastLogin() {
        var server = game.loadServerInfo();
        if (server) {
            game.connectAndLogin(server);
            self.sync = openLobby;
            self.panel && self.panel.close();
            self.draw = Stage.makeEllipsisDrawer();
        } else {
            self.panel && self.panel.close();
            game.setStage("selectServer");
        }
    }

    function openLobby(data) {
        if (data.Warning) {
            self.draw = function(){};
            game.clearPassword();
            showLoginForm();
            return;
        }
        self.panel && self.panel.close();
        game.setStage("lobby", data);
    }



    function signup(login, password, email) {
        game.setLogin(login);

        var formData = new FormData();
        formData.append("login", login);
        formData.append("password", password);
        formData.append("email", email);

        var req = new XMLHttpRequest();
        req.open("POST", game.gateway + "/register", true);
        req.send(formData);

        req.onload = makeResponseHandler(function() {
            game.setPassword(password);
            fastLogin();
        });
    }

    function validate(input, message) {
        if (input.value)
            return true;

        game.alert(T(message), function() {
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
                    var match = document.location.search.match(/access_token=(\w+)/);
                    var token = match && match[1];
                    if (token) {
                        oauthLogin(token);
                    } else {
                        showLoginForm();
                    }
                });
            }, function() {
                panel.show();
            }, '5.37');
        });
        script.onerror = function() {
            game.alert(T("Cannot connect to vk.com"));
            showLoginForm();
        };
    }

    function oauthLogin(token) {
        var formData = new FormData();
        formData.append("token", token);

        var req = new XMLHttpRequest();
        req.open("POST", game.gateway + "/oauth", true);
        req.send(formData);

        req.onload = makeResponseHandler(function() {
            game.oauthToken = token;
            fastLogin();
        });
    }

    function makeResponseHandler(callback) {
        return function() {
            console.log(this);
            switch (this.status) {
            case 200:
                callback.call(this);
                break;
            case 202:
                game.alert(T(this.response.trim()));
                break;
            default:
                console.error(this.response);
                game.alert(T("Cannot connect to server"));
                break;
            }
        };
    }
}

Stage.add(loginStage);
