"use strict";

var dom = {
    tag: function(tag, classOrId, cfg) {
        var elem = document.createElement(tag);

        if (classOrId) {
            this.setClassOrId(elem, classOrId);
        }
        if (cfg) {
            if (cfg.text !== undefined)
                elem.textContent = cfg.text;
            else if (cfg.html !== undefined)
                elem.innerHTML = cfg.html;

            if (cfg.onclick !== undefined)
                elem.onclick = cfg.onclick;

            if (cfg.title !== undefined)
                elem.title = cfg.title;
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
    span: function(text, classOrId, title) {
        return this.tag("span", classOrId, {text: text, title: title});
    },
    img: function(src, classOrId) {
        var img = new Image();
        img.src = src;
        if (classOrId) {
            this.setClassOrId(img, classOrId);
        }
        return img;
    },
    link: function(url, text, classOrId) {
        var link = dom.tag("a", classOrId);
        if (url) {
            link.target = "_blank";
            link.href = url;
        }
        if (text)
            link.textContent = text;
        return link;
    },
    button: function(text, classOrId, onclick) {
        return this.tag("button", classOrId, {text: text, onclick: onclick});
    },
    select: function(options, selected, classOrId) {
        return dom.wrap("select", this.make("select", options.map(function(value) {
            var option = dom.make("option", value);
            option.selected = (value == selected);;;;
            return option;
        })), classOrId);
    },
    option: function(text) {
        return this.tag("option", null, {text: text});
    },
    insert: function(element, toElem) {
        toElem = toElem || document.body;
        toElem.insertBefore(element, toElem.firstChild);
    },
    clear: function(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    detachContents: function(element) {
        var contents = [];
        while (element.firstChild) {
            contents.push(element.firstChild);
            element.removeChild(element.firstChild);
        }
        return contents;
    },
    make: function(tag, contents, classOrId) {
        return this.append(this.tag(tag, classOrId), contents);
    },
    append: function(element, contents) {
        if (Array.isArray(contents)) {
            var fragment = document.createDocumentFragment();
            contents.forEach((child) =>  child && this.appendOne(fragment, child));
            element.appendChild(fragment);
        } else if (contents) {
            this.appendOne(element, contents);
        }
        return element;
    },
    appendOne: function(element, content) {
        element.appendChild((content instanceof Node) ? content : document.createTextNode(content));
    },
    wrap: function(classOrId, elements, cfg) {
        return this.append(dom.div(classOrId, cfg), elements);
    },
    // TODO: use dom.append() instead?
    appendText: function(element, text) {
        element.appendChild(document.createTextNode(text));
    },
    input: function(text, value, type, name, textAfterInput) {
        var input = document.createElement("input");
        input.type = type || "text" ;
        if (name)
            input.name = name;
        if (value)
            input.value = value;
        var label = document.createElement("label");
        if (text && !textAfterInput)
            label.appendChild(document.createTextNode(text));

        label.appendChild(input);

        if (text && textAfterInput)
            label.appendChild(document.createTextNode(text));
        input.label = label;

        return input;
    },
    radioButton: function(text, name) {
        return this.input(text, null, "radio", name, true);
    },
    checkbox: function(text, name) {
        return this.input(text, null, "checkbox", name, true);
    },
    range: function(value, onchange) {
        const handle = dom.div("handle");
        const range = this.wrap("range", handle)
        let x = 0;

        handle.style.left = value * 100 + "%";
        range.onmousedown = function(event) {
            if (event.target == range) {
                x = range.getBoundingClientRect().left;
                onmousemove(event);
            } else {
                x = event.pageX - handle.offsetLeft;
            }
            window.addEventListener("mousemove", onmousemove);
            window.addEventListener("mouseup", function cancel() {
                window.removeEventListener("mouseup", cancel);
                window.removeEventListener("mousemove", onmousemove);
            });
        };
        return range;

        function onmousemove(event) {
            handle.style.marginLeft = 0; // remove margin, to fix left: 100% problem
            var oldX =  parseInt(handle.style.left);
            var maxX = handle.parentNode.clientWidth - handle.clientWidth;
            var newX = Math.max(0, Math.min(event.pageX - x, maxX));
            if (oldX == newX) {
                return;
            }
            handle.style.left = newX + "px";
            onchange(newX / maxX);
        };

    },
    iframe: function(src, classOrName) {
        var iframe = dom.tag("iframe", classOrName);
        iframe.src = src;
        return iframe;
    },
    table: function(header, rows, classOrId) {
        var dom = this;
        return this.make("table", [
            this.make("thead", this.make("tr", header.map(function(title) {
                return dom.make("th", title);
            }))),
            this.make("tbody", rows.map(function(row) {
                return dom.make("tr", row.map(function(cell) {
                    return dom.make("td", cell);
                }));
            }))
        ], classOrId);
    },
    ul: function(items, classOrId) {
        return this.make("ul", items.map(item => dom.make("li", item)), classOrId);
    },
    canvas: function (w, h, classOrId) {
        var canvas = dom.tag("canvas", classOrId);
        canvas.ctx = canvas.getContext("2d");
        canvas.width = w || 0;
        canvas.height = h || 0;
        return canvas;
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
    swap: function(one, two) {
        const parent = two.parentNode;
        const before = two.nextSibling;
        dom.replace(one, two);
        parent.insertBefore(one, before);
    },
    setContents: function(element, contents) {
        this.clear(element);
        return this.append(element, contents);
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

        cfg.forEach(function(tab, index) {
            var title = dom.div("tab-title");
            title.style.zIndex = cfg.length - index;
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

            if (tab.update) {
                tab.update = tab.update.bind(tabs, title, content);
            }

            title.onclick = function() {
                active.title.classList.remove("active");
                active.content.classList.remove("active");

                title.classList.add("active");
                content.classList.add("active");

                active.title = title;
                active.content = content;

                if (tab.update) {
                    tab.update();
                }
            };

            if (tab.init) {
                tab.init.call(tabs, title, content);
            }

            tab.isActive = function() {
                return title.classList.contains("active");
            };
            tab.activate = title.onclick;
            tab.tab = {
                title: title,
                content: content,
            };
        });

        tabs.appendChild(titles);
        tabs.appendChild(contents);
        tabs.titles = titles;
        tabs.contents = contents;
        tabs.tabs = cfg;

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
