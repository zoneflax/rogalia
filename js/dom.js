var dom = {
    tag: function(tag, classOrId, cfg) {
        var elem = document.createElement(tag);


        if (classOrId) {
            switch (classOrId.charAt(0)) {
            case "#":
                elem.id = classOrId.substring(1);
                break;
            case ".":
                elem.className = classOrId.substring(1);
                break;
            default:
                elem.className = classOrId;
            }
        }
        if (cfg) {
            if ("text" in cfg)
                elem.textContent = cfg.text;
        }

        return elem;
    },
    div: function(classOrId, cfg) {
        return this.tag("div", classOrId, cfg);
    },
    br: function() {
        return document.createElement("br");
    },
    hr: function() {
        return document.createElement("hr");
    },
    vr: function() {
        return this.div("vr");
    },
    slot: function() {
        return this.div("slot");
    },
    span: function(text, classOrId) {
        return this.tag("span", classOrId, {text: text});
    },
    link: function(url, text) {
        var link = document.createElement("a");
        link.target = "_blank";
        link.href = url;
        if (text)
            link.textContent = text;
        return link;
    },
    button: function(text, classOrId) {
        return this.tag("button", classOrId, {text: text});
    },
    select: function(options, classOrId) {
        var select = this.tag("select", classOrId);
        options && options.forEach(function(option) {
            select.appendChild(option);
        });
        return select;
    },
    option: function(text) {
        return this.tag("option", null, {text: text});
    },
    insert: function(element) {
        document.body.insertBefore(element, document.body.firstChild);
    },
    clear: function(element) {
        element.innerHTML = "";
    },
    append: function(element, contents) {
        contents.forEach(function(child) {
            if (child)
                element.appendChild(child);
        });
    },
    input: function(text, value, type, name) {
        var input = document.createElement("input");
        input.type = type || "text" ;
        if (name)
            input.name = name;
        if (value)
            input.value = value;
        var label = document.createElement("label");
        if (text)
            label.appendChild(document.createTextNode(text));
        label.appendChild(input);
        input.label = label;

        return input;
    },
    radioButton: function(text, name) {
        return this.input(text, null, "radio", name);
    },
    checkBox: function(text, name) {
        return this.input(text, null, "checkbox", name);
    },
    remove: function(element) {
        element.parentNode.removeChild(element);
    },
    hide: function(element) {
        element.classList.add("hidden");
    },
    show: function(element) {
        element.classList.remove("hidden");
    },
    toggle: function(element) {
        if(element.classList.contains("hidden"))
            this.show(element);
        else
            this.hide(element);
    },
    replace: function(old, New) {
        if (!old.parentNode) {
            console.trace();
            console.error("Cannot replace node");
            return;
        }
        old.parentNode.insertBefore(New, old);
        old.parentNode.removeChild(old);
    },
    move: function(element, to) {
        this.remove(element);
        to.appendChild(element);
    },
    forEach: function(selector, callback) {
        [].forEach.call(document.querySelectorAll(selector), function(elem) {
            callback.call(elem);
        });
    },
    addClass: function(selector, name) {
        this.forEach(selector, function() {
            this.classList.add(name);
        });
    },
    removeClass: function(selector, name) {
        this.forEach(selector, function() {
            this.classList.remove(name);
        });
    },
};
