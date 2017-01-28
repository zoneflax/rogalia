/* global dom, Panel, game, config, T */

"use strict";
class Jukebox {
    constructor() {
        this.iframe = dom.tag("iframe");
        this.entity = null;
        this.input = dom.input();
        this.input.onkeypress = (event) => {
            if (event.code == "Enter") {
                game.network.send("sign-edit", {Id: this.entity.Id, Text: this.input.value});
            }
        };
        this.panel = new Panel("jukebox", "Jukebox", [
            this.iframe,
            dom.hr(),
            this.input,
        ]);
        this.panel.temporary = true;

        this._videoRegexp = new RegExp(/^[A-Za-z0-9_-]{11}$/);
        this._current = {
            video: "",
            time: 0,
        };
    }

    play(video, time) {
        if (!this._videoRegexp.test(video)) {
            this.stop();
            return;
        }

        this.input.value = video;

        this._current.video = video;
        this._current.time = time;
        if (!config.sound.jukebox)
            return;

        game.sound.stopMusic();

        var src = "https://www.youtube-nocookie.com/embed/" + video + "?autoplay=1";
        if (time)
            src += "&start=" + time;
        this.iframe.src = src;
    }

    stop() {
        this.iframe.src = "";
    }

    toggle() {
        if (config.sound.jukebox) {
            this.play(this._current.video, this._current.time);
        } else {
            this.stop();
        }
    }

    open(entity) {
        this.entity = entity;
        this.panel.show();
        this.input.focus();
    }
}
