/* global game */

"use strict";
function Network() {
    this.proto = "ws://";
    this.host = "";
    this.port = 49000;
    this.addr = "";

    if (window.location.protocol == "https:") {
        this.proto = "wss://";
        this.port = 49443;
    }


    this.data = null;
    this.socket = null;

    this.queue = [];
    this.onwarn = null;

    this.run = function(host, onopen) {
        this.host = host;
        this.addr = host + ":" + this.port;
        this.socket = new WebSocket(this.proto + this.addr);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = onopen;

        function onDisconnect() {
            game.clearServerInfo();
            if (game.chat)
                game.chat.addMessage({From: "[Rogalik]", Body: "Disconnected"});
            game.exit(T("Disconnected"));
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
        if (this.sendStart) {
            game.controller.updatePing(Date.now() - this.sendStart);
            this.sendStart = 0;
        }

        if (game.debug.network.length)
            console.log("Server data len: ", message.data.byteLength);

        if (game.debug.network.data)
            console.log(data);

        if (data.Error) {
            this.queue = [];
            game.controller.showError(data.Error);
            return;
        }

        game.stage.sync(data);

        if (this.queue.length == 0)
            return;

        if (data.Ok) {
            var callback = this.queue.pop();
            var result = callback(data);
            if (result instanceof Function)
                this.queue.push(result);
        } else if (data.Warning) {
            this.queue = [];
            if (this.onwarn) {
                this.onwarn(data.Warning);
            }
            this.onwarn = null;
        }
    }

    this.shutdown = function() {
        this.socket.onclose = null;
        this.socket.close();
    };

    this.send = function(command, args, callback, onwarn = null) {
        args = args || {};
        args.Command = command;

        // if (game.stage.name == "main")
        //     args.Fps = game.controller.system.fps.currentFps();

        this.sendStart = Date.now();
        this.socket.send(JSON.stringify(args));

        if (callback)
            this.queue.push(callback);

        this.onwarn = onwarn;
    };

    //for debug
    this.sendRaw = function(cmd) {
        this.socket.send(JSON.stringify(cmd));
    };
}
