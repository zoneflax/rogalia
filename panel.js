function Panel(name, title, elements, listener, hooks) {
    if (name in game.panels)
        game.panels[name].close();

    game.panels[name] = this;
    this.name = name;
    this.visible = false;

    this.lsKey = "panels." + this.name;
    var config = JSON.parse(localStorage.getItem(this.lsKey)) || {}
    if("position" in config) {
        this.position = config.position;
    } else {
        this.position = {
            x: game.offset.x + game.screen.width / 2,
            y: game.offset.y + game.screen.height / 2,
        }
    }

    this.element = document.createElement("div");
    this.element.id = name;
    this.element.className = "panel";
    this.element.style.left = this.position.x + "px";
    this.element.style.top = this.position.y + "px";

    this.contents = document.createElement("div");
    this.contents.className = "contents";

    var text = document.createElement("div");
    text.className = "text";
    text.title = T(title);
    text.textContent = text.title;

    var titleBar = document.createElement("header");
    titleBar.className = "title-bar";
    titleBar.appendChild(text);

    var close = document.createElement("span");
    close.className = "close";
    close.panel = this;
    close.onclick = this.hide.bind(this);
    close.innerHTML = "&times;";
    titleBar.appendChild(close);

    this.element.appendChild(titleBar);

    hooks = hooks || {};
    this.hooks = {
        show: hooks.show,
        hide: hooks.hide,
    };

    this.insert = function(list) {
    }

    if (elements && elements.length) {
        this.replace(elements);
    } else {
        var contents = document.getElementById(name);
        if (contents) {
            contents.id += "-panel";
            this.contents.appendChild(contents);
        }
    }

    this.element.appendChild(this.contents);


    util.draggable(this.element);

    if(listener instanceof Function) {
        this.element.addEventListener('click', listener.bind(this));
    } else if (listener instanceof Object) {
        for(var type in listener) {
            this.element.addEventListener(type, listener[type]);
        }
    }

    this.element.addEventListener('mousedown', this.toTop.bind(this));
    this.element.addEventListener('mousedown', function() {
        game.controller.unhighlight(name);
    });
    this.element.id = name;
    util.dom.insert(this.element);

    if ("visible" in config && config.visible)
        this.show();
}

Panel.checkCollision = function() {
    var x = game.controller.mouse.x;
    var y = game.controller.mouse.y;

    for(var name in game.panels) {
        var panel = game.panels[name];
        if(!panel.visible)
            continue;
        if(util.intersects(
            x,
            y,
            panel.x,
            panel.y,
            panel.width,
            panel.height
        )) {
            return panel;
        }
    }
    return null;
}

Panel.zIndex = 1;
Panel.top = null;
Panel.stack = [];

Panel.prototype = {
    get x() {
        return this.element.offsetLeft || this.position.x;
    },
    get y() {
        return this.element.offsetTop || this.position.y;
    },
    get width() {
        return parseInt(getComputedStyle(this.element).width);
    },
    get height() {
        return parseInt(getComputedStyle(this.element).height);
    },
    toTop: function() {
        this.element.style.zIndex = ++Panel.zIndex;
        if (Panel.top && Panel.top != this) {
            Panel.stack.push(Panel.top);
        }
        Panel.top = this;
    },
    hide: function() {
        this.hooks.hide && this.hooks.hide.call(this);
        this.savePosition();
        this.element.style.display = "none";
        if (this.button)
            this.button.classList.remove("opened");
        this.visible = false;
        var next = Panel.stack.pop();
        if (next)
            Panel.top = next;
    },
    close: function() {
        this.hide();
        if (this.element && this.element.parentNode)
            util.dom.remove(this.element);
    },
    replace: function(elements) {
        this.contents.innerHTML = "";
        for(var i = 0, l = elements.length; i < l; i++) {
            this.contents.appendChild(elements[i]);
        }
    },
    show: function() {
        this.toTop();
        this.element.style.display = "block";
        if (this.button)
            this.button.classList.add("opened");
        this.visible = true;
        if (!util.rectIntersects(
            this.x, this.y, this.width, this.height,
            0, 0, window.innerWidth, window.innerHeight
        )) {
            this.element.style.left = game.offset.x + "px";
            this.element.style.top = game.offset.y + "px";
        }
        this.hooks.show && this.hooks.show.call(this);
        window.scrollTo(0, 0);
    },
    toggle: function() {
        if (this.visible)
            this.hide();
        else
            this.show();
    },
    savePosition: function() {
        this.position.x = this.x;
        this.position.y = this.y;
        var config = {
            position: this.position,
            visible: this.visible,
        }
        localStorage.setItem(this.lsKey, JSON.stringify(config));
    },
    setWidth: function(w) {
        var pad = 12;
        this.element.style.width = w + pad + "px";
        this.element.style.maxWidth = w + pad + "px";
    },
}
