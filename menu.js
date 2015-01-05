function Menu(x, y) {
    this.container = document.getElementById("menu");
    this.visible = false;
    this.offset = {
        x: x,
        y: y,
    };
};

Menu.prototype = {
    show: function(object, x, y, reuse, defaultAction) {
        if (game.player.acting)
            return false;
        if (!object)
            return false;
        var actions = object.getActions();
        if (defaultAction)
            actions.Use = object.defaultAction;

        if (!actions)
            return false;

        x = x || game.controller.iface.x;
        y = y || game.controller.iface.y;

        this.container.style.display = "inline-block";
        this.container.innerHTML = '';
        if (!reuse) {
            this.container.style.left = x + game.offset.x + "px";
            this.container.style.top = y + game.offset.y + "px";
        }
        this.container.appendChild(this.createMenu(actions, object));
        this.visible = true;
        return true;
    },
    mouseover: function(e) {
        var menuItem = e.target;
        var item = menuItem.item;
        if (!item)
            return;
        game.controller.world.menuHovered = item;
    },
    hide: function() {
        if(!this.visible)
            return;
        this.container.style.display = "none";
        this.visible = false;
        game.controller.world.menuHovered = null;
    },
    createMenuItem: function(title, action, object) {
        var item_a = document.createElement("a");
        item_a.textContent = util.symbolToString(title);
        item_a.className = "action";

        if (action instanceof Function) {
            var callback = action.bind(object);
        } else {
            item_a.item = action.item;
            item_a.addEventListener("mousemove", this.mouseover)
            callback = action.callback.bind(action.item);
        }

        item_a.onclick = function() {
            this.hide();
            callback();
        }.bind(this);

        var item = document.createElement("li");
        item.appendChild(item_a)
        return item;
    },
    createMenu: function(actions, object) {
        var ul = document.createElement("ul");

        for(var title in actions) {
            var menuItem = this.createMenuItem(title, actions[title], object);
            ul.appendChild(menuItem);
        }
        return ul;
    }
};
