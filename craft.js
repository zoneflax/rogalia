function Craft() {
    this.visibleGroups = {};
    this.filter = function(recipe) {
        return !recipe.IsBuilding;
    };
    this.selected = null;
    this.slots = [];
    this.current = {};
    this.requirements = null;

    this.searchField = this.createSearchField();
    this.list = this.createList();
    this.recipeDetails = this.createRecipeDetails();

    this.panel = new Panel(
        "craft",
        "Craft",
        [this.searchField, this.list, this.recipeDetails],
        this.panelInit.bind(this)
    );
    this.panel.element.style.minWidth = "500px";
    this.panel.hooks.hide = this.cleanUp.bind(this);
    this.panel.hooks.show = this.update.bind(this);
}


Craft.prototype = {
    visibleGroups: null,
    update: function() {
        if (!this.panel.visible)
            return;
        //TODO: we ignore stats updates; fix this
        return;
        //TODO: this is ugly; refactor
        var list = this.createList()
        var st = this.list.scrollTop;
        util.dom.replace(this.list, list);
        this.list = list;
        this.list.scrollTop = st;
        if (this.current.recipe) {
            this.renderRequirements(this.current.recipe);
        }
    },
    use: function(from, to) {
        var e = Entity.get(from.id)
        if (!e.is(to.group))
            return false;

        if (this.slots.some(function(slot) {
            return slot.firstChild.id == from.id;
        })) {
            return false;
        }
        from.block();
        var ingredient = e.icon();
        ingredient.id = e.Id;
        ingredient.unblock = from.unblock;
        var index = this.slots.indexOf(to);
        this.slots[index].used = true;
        this.slots[index].unblock = from.unblock;
        to.innerHTML = "";
        to.appendChild(ingredient);
        to.onclick = this.cancel.bind(this, from, to);
        return true;
    },
    cleanUp: function() {
        for(var i = 0, l = this.slots.length; i < l; i++) {
            var slot = this.slots[i];
            this.cancel(slot.item, slot);
        }
        // this.slots = [];
        // this.requirements = null;
    },
    createList: function() {
        var list = document.createElement("ul");
        list.className = "recipe-list";
        var groups = {};
        for(var type in Entity.Recipes) {
            var recipe = Entity.Recipes[type];
            var group = recipe.Skill;
            if (!groups[group])
                groups[group] = {};
            groups[group][type] = recipe;
        }

        for (var group in groups) {
            var recipes = groups[group];
            var subtree = document.createElement("ul");
            subtree.className =  (this.visibleGroups[group]) ? "" : "hidden";
            subtree.group = group;

            for (var type in recipes) {
                var recipe = recipes[type];
                if (!this.filter(recipe))
                    continue;
                var item = document.createElement("li");
                item.className = "recipe";
                item.recipe = recipe;
                item.title = TS(type);
                item.textContent = item.title;
                item.type = type;
                if (this.selected && this.selected.type == item.type) {
                    item.classList.add("selected");
                    this.selected = item;
                }
                if (recipe.isNew)
                    item.classList.add("new");

                if (!this.safeToCreate(recipe))
                    item.classList.add("unavailable");

                subtree.appendChild(item);
            }

            if (subtree.children.length == 0)
                continue;

            var subtreeLi = document.createElement("li");
            var groupToggle = document.createElement("span");
            var visibleGroups = this.visibleGroups;
            groupToggle.className = "group-toggle";
            groupToggle.textContent = T(group);
            groupToggle.subtree = subtree;
            groupToggle.onclick = function() {
                util.dom.toggle(this);
                visibleGroups[this.group] = !this.classList.contains("hidden");
            }.bind(subtree);
            subtreeLi.appendChild(groupToggle);
            subtreeLi.appendChild(subtree);
            list.appendChild(subtreeLi);
        }

        if (list.children.length == 0)
            list.textContent = "You have no recipes";

        return list;
    },
    createSearchField: function() {
        var input = document.createElement("input");
        input.placeholder = T("search");
        input.addEventListener("keyup", this.search.bind(this));
        var label = document.createElement("label");
        label.className = "recipe-search";
        label.appendChild(input);
        return label;
    },
    search: function(e) {
        //TODO: fast solution; make another one
        var id = "#" + this.panel.name + " ";
        var input = e.target;
        var pattern = input.value.toLowerCase().replace(" ", "-");
        util.dom.removeClass(id + ".recipe-list .found", "found");
        if (!pattern) {
            this.list.classList.remove("searching");;
            return;
        }
        this.list.classList.add("searching");
        util.dom.addClass(id + ".recipe[type*='" + pattern + "']", "found")
        util.dom.forEach(id + ".recipe.found", function() {
            this.parentNode.parentNode.classList.add("found");
        })
    },
    createRecipeDetails: function() {
        var recipeDetails = document.createElement("div");
        recipeDetails.className = "recipe-details";
        recipeDetails.textContent = T("Select recipe");
        return recipeDetails;
    },
    seen: function(item) {
        if (item.recipe.isNew) {
            item.recipe.isNew = false;
            item.classList.remove("new");
        }
    },
    linkRecipe: function(title, recipe) {
        var base = (recipe.IsBuilding) ? T("Build") : T("Craft");
        game.chat.send("${" + base + " → " + recipe.Skill + " → " + title + "}");
    },
    panelInit: function(e) {
        var recipe = e.target.recipe;
        if(!recipe)
            return;

        if (game.controller.modifier.shift) {
            this.linkRecipe(e.target.title, recipe);
            return;
        }

        this.seen(e.target);
        e.target.classList.add("selected");

        if (this.selected)
            this.selected.classList.remove("selected");

        this.selected = e.target;

        this.cleanUp();
        this.current = {
            recipe: recipe,
            type: e.target.type,
            title: e.target.title
        };
        this.renderRecipe()
    },
    renderRecipe: function() {
        this.recipeDetails.innerHTML = "";
        this.requirements = null;
        this.slots = [];

        var recipe = this.current.recipe;

        var title = document.createElement("span");
        title.textContent = T(this.current.title);
        this.type = this.current.type;
        var ingredients = document.createElement("ul");
        var slots = [];

        for(var group in recipe.Ingredients) {
            var groupTitle = TS(group);
            var ingredient = document.createElement("li");
            var required = T(recipe.Ingredients[group]);
            ingredient.textContent = required + "x " + groupTitle;
            ingredients.appendChild(ingredient);

            for(var j = 0; j < required; j++) {
                var slot = document.createElement("div");
                slot.className = "slot";
                var image = Entity.getPreview(group);

                image.title = groupTitle;
                slot.image = image;
                slot.item = null;
                slot.appendChild(image);
                slot.title = groupTitle;
                slot.group = group;
                slot.craft = true; //TODO: fix; required for controller (apply "use")
                slot.used = false;
                slots.push(slot);
                slot.check = function(cursor) {
                    return cursor.entity.is(this.group);
                }
            }
        }

        var hr = function() {
            this.recipeDetails.appendChild(util.hr());
        }.bind(this);
        this.recipeDetails.appendChild(title);
        hr();
        var preview = Entity.templates[this.current.type].icon();
        this.recipeDetails.appendChild(preview);
        hr();
        this.renderRequirements(recipe);
        hr()
        this.recipeDetails.appendChild(ingredients);
        hr();
        for(var i = 0, l = slots.length; i < l; i++) {
            this.recipeDetails.appendChild(slots[i]);
            this.slots.push(slots[i]);
        }

        var auto = document.createElement("button");
        auto.className = "recipe-auto";
        auto.textContent = T("Auto");
        auto.onclick = this.auto;

        var create = document.createElement("button");
        create.className = "recipe-create";
        create.textContent = T("Create");
        create.onclick = this.create.bind(this);

        var all = document.createElement("button");
        all.className = "recipe-craft-all";
        all.textContent = T("Craft all");
        all.onclick = this.craftAll.bind(this);

        this.recipeDetails.appendChild(all);
        this.recipeDetails.appendChild(auto);
        this.recipeDetails.appendChild(create);
    },
    auto: function() {
        for (var i in game.containers) {
            var container = game.containers[i];
            container.visible && container.items.forEach(function(item) {
                item && container.dwimCraft(item);
            })
        }
    },
    craftAll: function() {
        this.auto();
        this.create(true);
    },
    create: function(craftAll) {
        var ingredients = [];
        for(var i = 0, l = this.slots.length; i < l; i++) {
            var ingredient = this.slots[i].firstChild;
            if (!ingredient.id)
                return false;
            ingredients.push(parseInt(ingredient.id));
        }
        var done = function (data) {
            if (data.Warning)
                return null;
            if (!data.Done)
                return done;
            this.cleanUp();
            this.renderRecipe();
            if (craftAll === true)
                setTimeout(this.craftAll.bind(this), 100);
        }.bind(this);

        game.network.send("craft", {type: this.type, ingredients: ingredients}, done, craftAll);
        return true;
    },
    cancel:  function(from, to) {
        var index = this.slots.indexOf(to);
        var slot = this.slots[index];
        slot.used = false;
        slot.unblock && slot.unblock();
        to.innerHTML = "";
        to.appendChild(to.image);
    },
    safeToCreate: function(recipe) {
        var skill = game.player.Skills[recipe.Skill];
        if (!skill)
            game.error("Skill %s not found", recipe.Skill);
        return skill.Value.Current >= recipe.Lvl;
    },
    renderRequirements: function(recipe) {
        var requirements = document.createElement("div");

        requirements.appendChild(document.createTextNode(T("Requirements")));
        var deps = document.createElement("ul");



        if (recipe.Skill) {

            var skill = document.createElement("li");
            skill.textContent = sprintf("%s: %s", T("Skill"), T(recipe.Skill)) +
                ((recipe.Lvl > 0) ? (" " + recipe.Lvl) : "");

            if (!this.safeToCreate(recipe)) {
                skill.className = "unavailable";
                if (recipe.IsBuilding)
                    skill.title = T("Cannot complete building");
                else
                    skill.title = T("High chance of failing");
            }
            deps.appendChild(skill);
        }

        if (recipe.Tool) {
            var tool = document.createElement("li");
            tool.textContent = TS(recipe.Tool);
            deps.appendChild(tool);
        }

        if (recipe.Equipment) {
            var equipment = document.createElement("li");
            equipment.textContent = TS(recipe.Equipment);
            deps.appendChild(equipment);
        }

        if (recipe.Liquid) {
            var liquid = document.createElement("li");
            liquid.textContent = TS(recipe.Liquid.Type) + ": " + recipe.Liquid.Volume;
            deps.appendChild(liquid);
        }

        requirements.appendChild(deps);

        if (this.requirements)
            util.dom.replace(this.requirements, requirements)
        else
            this.recipeDetails.appendChild(requirements);

        this.requirements = requirements;
    }
}
