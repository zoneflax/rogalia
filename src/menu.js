/* global dom, Panel, game, TS */

"use strict";
//TODO: use panel methods!
function Menu() {
    this.container = null;
    this.visible = false;
    this.length = 0;
};

Menu.prototype = {
    activate: function(index) {
        //TODO: use internal array;
        var item = document.getElementById("menu-item-" + index);
        if (item)
            item.click();
    },
    show: function(object, reuse, addDefaultAction) {
        if (game.player.acting)
            return false;
        if (!object)
            return false;

        var actions = object;

        if ("getActions" in object)
            actions = object.getActions();

        if (!actions)
            return false;

        var x, y;
        if (reuse && this.container) {
            x = this.container.x;
            y = this.container.y;
        } else {
            x = (x || game.controller.mouse.x);
            y = (y || game.controller.mouse.y);
        }

        if (!Array.isArray(actions))
            actions = [actions];

        if (addDefaultAction)
            actions[0]["Use"] = object.defaultAction;

        this.length = 0;

        var contents = _
            .reject(actions, _.isEmpty)
            .map((group) => (group == "---") ? dom.hr() : this.createMenu(group, object));

        if (this.container && reuse) {
            this.container.fixHeight();
            this.container.setContents(contents);
        } {
            this.container = new Panel("menu", "Menu", contents);
            this.container.hideTitle();
        }
        this.container.show(x, y);
        this.container.fitToScreen();
        this.visible = true;
        return true;
    },
    mouseover: function(e) {
        var menuItem = e.target;
        var item = menuItem.item;
        if (item) {
            game.controller.world.menuHovered = item;
        }
    },
    hide: function() {
        if (this.visible) {
            this.container.hide();
            this.visible = false;
            game.controller.world.menuHovered = null;
        }
    },
    createMenuItem: function(title, action, object, index) {
        if (title == "Destroy" || title == "suicide")
            index = 0;

        const item = dom.make("a", index + ". " + TS(util.stringToSymbol(title)), "action");
        if (action instanceof Function) {
            var callback = action.bind(object);
        } else {
            item.item = action.item;
            item.onmousemove = this.mouseover;
            callback = action.callback.bind(action.item);
        }

        item.onclick = () => {
            this.hide();
            callback();
        };
        item.id = "menu-item-" + index;

        return dom.make("li", item);
    },
    createMenu: function(actions, object) {
        var menu = document.createElement("ul");
        var sorted = Object.keys(actions).sort(function(a, b) {
            if (a == "Destroy" || a == "suicide")
                return +1;
            else
                return TS(a) > TS(b);
        });
        //TODO: fixme controller.drawItemsMenu hack and remove trim
        return dom.make(
            "ul",
            sorted.map(
                (title, index) => this.createMenuItem(title.trim(), actions[title], object, ++this.length)
            )
        );
    }
};
