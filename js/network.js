"use strict";
function Network() {
    this.proto = "ws://";
    this.host = "rogalik.tatrix.org";
    this.port = 49000;
    if (window.location.protocol == "https:") {
        this.proto = "wss://";
        this.port = 49443;
    }


    var override = document.location.search.match(/server=([^&]+)/);
    if (override) {
        override = override[1].split(":");
        this.host = override[0] || this.host;
        this.port = override[1] || this.port;
    }

    this.addr = this.host + ":" + this.port;

    this.data = null;
    this.socket = null;

    this.callback = null;
    this.defaultCallback = null;

    this.run = function() {
        this.socket = new WebSocket(this.proto + this.addr);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = function() {
            game.setStage("login");
        };

        function onDisconnect() {
            window.onerror = null;
            if (game.chat)
                game.chat.addMessage({From: "[Rogalik]", Body: "Disconnected"});
            game.exit("Disconnected. Try again later.");
        }

        // if (e.wasClean)
        this.socket.onclose = onDisconnect;

        this.socket.onerror = function(error) {
	    console.log(error);
            onDisconnect();
        };
        this.socket.onmessage = onmessage.bind(this);
    };

    this.disconnect = function() {
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
            this.socket = null;
        }
    };

    function onmessage(message) {
        var decompressed = util.decompress(message.data);
        var data = JSON.parse(decompressed);
        this.data = data;
        if(this.sendStart && data.Ack) {
            game.ping = Date.now() - this.sendStart;
            if (game.controller.system && game.controller.system.panel.visible) {
                game.controller.system.ping.textContent = "Ping: " + game.ping + "ms";
            }
            this.sendStart = 0;
        }

        if (game.debug.network.length)
            console.log("Server data len: ", message.data.byteLength);

        if (game.debug.network.data)
            console.dir(data);

        if (data.Error) {
            game.controller.showError(data.Error);
            return;
        }

        game.stage.sync(data);

        if (data.Ack || data.Done || data.Warning) {
            var callback = (this.callback) ? this.callback(data) : this.defaultCallback;
            this.callback = (callback instanceof Function) ? callback : null;
        }
    }

    this.shutdown = function() {
        this.socket.onclose = null;
        this.socket.close();
    };

    var lastSend = 0;
    this.send = function(command, args, callback, setAsDefault) {
        var now = Date.now();
        if (now - lastSend < 25)
            return;
        lastSend = now;
        args = args || {};
        args.Command = command;

        // if (game.stage.name == "main")
        //     args.Fps = game.controller.system.fps.currentFps();

        this.sendStart = Date.now();
        this.socket.send(JSON.stringify(args));

        if (callback) {
            this.callback = callback;
            if (setAsDefault)
                this.defaultCallback = callback;
        }
    };

    //for debug
    this.sendRaw = function(cmd) {
        this.socket.send(JSON.stringify(cmd));
    };
}
