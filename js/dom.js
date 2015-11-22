var dom = {
    tag: function(tag, classOrId, cfg) {
        var elem = document.createElement(tag);


        if (classOrId) {
            this.setClassOrId(elem, classOrId);
        }
        if (cfg) {
            if ("text" in cfg)
                elem.textContent = cfg.text;
        }

        return elem;
    },
    setClassOrId: function(elem, classOrId) {
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
    },
    text: function(text) {
        return document.createTextNode(text);
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
    img: function(src, classOrId) {
        var img = new Image();
        img.src = src;
        this.setClassOrId(img, classOrId);
        return img;
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
    insert: function(element, toElem) {
        toElem = toElem || document.body;
        toElem.insertBefore(element, toElem.firstChild);
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
    appendText: function(element, text) {
        element.appendChild(document.createTextNode(text));
    },
    input: function(text, value, type, name) {
        var input = document.createElement("input");
        input.type = type || "text" ;
        if (name)
            input.name = name;
        if (value)
            input.value = value;
        var label = document.createElement("label");
        label.appendChild(input);
        if (text)
            label.appendChild(document.createTextNode(text));
        input.label = label;

        return input;
    },
    radioButton: function(text, name) {
        return this.input(text, null, "radio", name);
    },
    checkbox: function(text, name) {
        return this.input(text, null, "checkbox", name);
    },
    /* * * * * */
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
    /* * * * * */
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
    /* * * * * */
    // dom.tabs([
    //     {
    //         title: T("text"),
    //         icon: new Image(), // *optional
    //         contents: [elem, ...],
    //         update: function(title, contents){}, // *optional
    //         init: function(title, contents){}, // *optional
    //     },
    //         ...
    // ]);
    tabs: function(cfg) {
        var tabs = dom.div("tabs");
        var titles = dom.div("tabs-titles");
        var hr = dom.hr();
        var contents = dom.div("tabs-contents");

        cfg.forEach(function(tab) {
            var title = dom.div("tab-title");
            if (tab.icon) {
                tab.icon.classList.add("tab-icon");
                title.appendChild(tab.icon);
            }
            dom.appendText(title, tab.title);
            titles.appendChild(title);


            var content = dom.div("tab-content");
            if (tab.contents)
                dom.append(content, tab.contents);
            contents.appendChild(content);

            title.onclick = function() {
                active.title.classList.remove("active");
                active.content.classList.remove("active");

                title.classList.add("active");
                content.classList.add("active");

                active.title = title;
                active.content = content;

                if (tab.update) {
                    tab.update.call(tabs, title, content);
                }
            };

            if (tab.init) {
                tab.init.call(tabs, title, content);
            }
        });

        tabs.appendChild(titles);
        tabs.appendChild(hr);
        tabs.appendChild(contents);
        tabs.titles = titles;
        tabs.hr = hr;
        tabs.contents = contents;

        var active = {
            title: titles.firstChild,
            content: contents.firstChild,
        };

        active.title.classList.add("active");
        active.content.classList.add("active");
        if (cfg[0].update) {
            cfg[0].update.call(tabs, active.title, active.content);
        }

        return tabs;
    }
};
