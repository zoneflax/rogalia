/* global Panel, dom, T, game, FormData, fetch */

"use strict";

class Profile {
    constructor() {
        this.email = dom.input("Email");

        this.password = dom.input("Password", "", "password");
        this.repeatPassword = dom.input("Repeat password", "", "password");

        this.email.onkeyup = (event) => {
            this._validate(this.email, this.email.value != "");
            if (event.key == "Enter") {
                this.password.focus();
            }
        };

        this.password.onkeyup = (event) => {
            this._validate(this.password, this.password.value != "");
            if (event.key == "Enter") {
                this.repeatPassword.focus();
            }
        };

        this.repeatPassword.onkeyup = (event) => {
            this._validate(this.repeatPassword, this.password.value == this.repeatPassword.value);
            if (event.key == "Enter") {
                this._create();
            }
        };

        this.createButton = dom.button(T("Create account"), "", () => this._create());
        this.createButton.disabled = true;

        this.panel = new Panel("profile", "Profile", [
            dom.make("p", T("Create account to play from a browser (latest Chrome and Opera only)")),
            dom.link("http://play.rogalia.ru?lang=" + game.lang, T("Open browser client")),
            dom.hr(),
            this.email.label,
            this.password.label,
            this.repeatPassword.label,
            dom.hr(),
            this.createButton,
        ]);
    }

    _create() {
        if (this.createButton.disabled) {
            return;
        }
        this.createButton.disabled = true;
        this.createButton.locked = true;
        const body = new FormData();
        body.append("email", this.email.value);
        body.append("password", this.password.value);
        body.append("token", game.loadSessionToken());

        fetch(game.gateway + "/link", {method: "POST", body})
            .then(response => {
                if (response.status == 200) {
                    this.panel.setContents([
                        T("Done")
                    ]);
                } else {
                    this.createButton.locked = false;
                    this._update();
                    response.text().then(message => game.popup.alert(T(message.trim())));
                }
            })
            .catch(error => {
                console.error(error.message);
                game.popup.alert(T("Cannot connect to server"));
            });
    }

    _validate(input, valid) {
        if (valid) {
            input.classList.remove("error");
            input.classList.add("valid");
        } else {
            input.classList.add("error");
            input.classList.remove("valid");
        }
        this._update();
    }

    _update() {
        this.createButton.disabled = !(
            !this.createButton.locked &&
                this.email.classList.contains("valid") &&
                this.password.classList.contains("valid") &&
                this.repeatPassword.classList.contains("valid")
        );
    }
}
