"use strict";
function Craft() {
    this.visibleGroups = {};
    this.buildButton = null;
    this.filter = function(recipe) {
        return true;
    };
    this.selected = null;
    this.slots = [];
    this.current = {};
    this.requirements = null;

    this.list = this.createList();

    this.searchInput = null;

    this.listWrapper = document.createElement("div");;
    this.listWrapper.id = "recipe-list-wrapper";
    this.listWrapper.appendChild(this.createSearchField());
    this.listWrapper.appendChild(util.hr());
    this.listWrapper.appendChild(this.createFilters());
    this.listWrapper.appendChild(this.list);


    this.titleElement = document.createElement("div");
    this.ingredientsList = document.createElement("ul");
    this.ingredientsList.className = "ingredients-list";

    this.recipeDetails = this.createRecipeDetails();

    this.panel = new Panel(
        "craft",
        "Craft",
        [this.listWrapper, util.vr(), this.recipeDetails],
        this.clickListener.bind(this)
    );
    this.panel.hooks.hide = this.cleanUp.bind(this);
    this.panel.hooks.show = this.update.bind(this);

    this.blank = {
        type: null,
        panel: new Panel("blank-panel", "Build"),
        entity: null,
        canUse: function(item) {
            var e = Entity.get(item.id);
            if (!e)
                game.error("Build.use: cannot find item %d", item.id);
            for (var group in this.entity.Props.Ingredients) {
                if (e.is(group)) {
                    return e;
                }
            }
            return null;
        },
        use: function(item) {
            // if ingredint is correct one
            // send network command
            var e = this.canUse(item);
            if (e) {
                game.network.send("build-add", {blank: this.entity.Id, id: e.Id})
                return true;
            }
            // else do now allow using item
            return false;
        },
    };

    this.build = function(e) {
        game.controller.creatingCursor(this.blank.type, "build");
        this.panel.hide();
    }.bind(this);
}


Craft.prototype = {
    visibleGroups: null,
    recipe: function(type) {
        return Entity.recipes[type];
    },
    render: function(blank) {
        var ingredients = blank.Props.Ingredients;
        var type = blank.Props.Type;
        var recipe = this.recipe(type);
        // if it's an old item which no has no recipe
        if (!recipe)
            return;
        this.titleElement.textContent = TS(type);

        this.ingredientsList.innerHTML = "";
        var canBuild = true;
        for(var group in ingredients) {
            var has = ingredients[group];
            var required = recipe.Ingredients[group];
            var name = TS(group.replace("meta-", ""));
            var ingredient = Stats.prototype.createParam(name, {Current: has, Max: required});
            canBuild = canBuild && (has == required);
            this.ingredientsList.appendChild(ingredient);
        }
        this.buildButton.disabled = !canBuild;
    },
    update: function() {
        if (this.blank.entity)
            this.render(this.blank.entity);

        if (!this.panel.visible)
            return;

        //TODO: we ignore stats updates; fix this
        return;
        //TODO: this is ugly; refactor
        var list = this.createList();
        var st = this.list.scrollTop;
        util.dom.replace(this.list, list);
        this.list = list;
        this.list.scrollTop = st;
        if (this.current.recipe) {
            this.renderRequirements(this.current.recipe);
        }
    },
    updateVisibility: function() {
        var panel = this.blank.panel;
        var e = this.blank.entity;
        if (panel && e && !game.player.isNear(e)) {
            panel.hide();
        }
    },
    open: function(blank, burden) {
        this.blank.entity = blank;

        var slotHelp = document.createElement("div");
        slotHelp.textContent = T("Drop ingredients here") + ":";

        this.slot = document.createElement("div");
        this.slot.classList.add("slot");
        this.slot.build = true;

        var auto = document.createElement("button");
        auto.className = "build-auto";
        auto.textContent = "Auto";
        var self = this;
        var recipe = this.recipe(blank.Props.Type);
        auto.onclick = function() {
            var list = [];
            var items = [];
            this.auto(function(item) {
                items.push(item.entity);
            });
            for (var group in blank.Props.Ingredients) {
                var has = blank.Props.Ingredients[group];
                var required = recipe.Ingredients[group];
                var ok = true;
                while (has < required && ok) {
                    var i = items.findIndex(function(item) {
                        return item.is(group);
                    });
                    if (i != -1) {
                        list.push(items[i].Id);
                        items.splice(i, 1);
                        has++;
                    } else {
                        ok = false;
                    }
                }
            }
            if (list.length > 0)
                game.network.send("build-add", {Blank: blank.Id, List: list});
        }.bind(this);

        var buildButton = document.createElement("button");
        buildButton.textContent = T("Build");
        buildButton.className = "build-button";
        buildButton.onclick = function(e) {
            game.network.send("build", {id: blank.Id}, function() {
                game.help.actionHook("build-"+blank.Props.Type);
            });
            this.blank.panel.hide();
        }.bind(this);
        this.buildButton = buildButton;

        this.blank.panel.setContents([
            this.titleElement,
            util.hr(),
            slotHelp,
            this.slot,
            util.hr(),
            this.ingredientsList,
            auto,
            buildButton,
        ]);

        this.render(blank);
        this.blank.panel.show();

        if (burden) {
            this.blank.use({id: burden});
        }
    },
    use: function(from, to) {
        var e = Entity.get(from.id);
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
        list.className = "recipe-list no-drag";
        var groups = {};
        for (var group in game.player.Skills) {
            groups[group] = {};
        }
        Entity.getSortedRecipeTuples().forEach(function(tuple) {
            var type = tuple[0];
            var recipe = tuple[1];
            groups[recipe.Skill][type] = recipe;
        });

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
                item.classList.add(["portable", "liftable", "static"][Entity.templates[type].MoveType]);
                item.recipe = recipe;
                item.title = TS(type);
                item.dataset.search = item.title.toLowerCase().replace(" ", "-");
                item.textContent = item.title;
                item.type = type;
                if (this.selected && this.selected.type == item.type) {
                    item.classList.add("selected");
                    this.selected = item;
                }

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

            var icon = new Image();
            icon.src = "assets/icons/skills/" + group.toLowerCase() + ".png";

            subtreeLi.appendChild(icon);
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
        input.addEventListener("keyup", this.searchHandler.bind(this));
        this.searchInput = input;

        var label = document.createElement("label");
        label.className = "recipe-search";
        label.appendChild(input);
        return label;
    },
    createFilters: function() {
        var filters = document.createElement("div");
        return filters;
        //TODO: add icons and remove return
        var recipeList = this.list;
        ["portable", "liftable", "static", "unavailable"].forEach(function(name) {
            var label = document.createElement("label");
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true; //TODO: save to localStorage
            checkbox.onchange = function(e) {
                recipeList.classList.toggle("filter-"+name);
            };
            label.appendChild(checkbox);
            label.title = T(name);
            filters.appendChild(label);
        });
        return filters;
    },
    searchHandler: function(e) {
        var input = e.target;
        this.search(e.target.value);
    },
    makeSearch: function(pattern) {
        return this.search.bind(this, pattern, true);
    },
    search: function(pattern, selectMatching) {
        this.panel.show();
        //TODO: fast solution; make another one
        var id = "#" + this.panel.name + " ";
        util.dom.removeClass(id + ".recipe-list .found", "found");
        if (!pattern) {
            this.list.classList.remove("searching");;
            return;
        }
        this.list.classList.add("searching");

        pattern = pattern.toLowerCase().replace(" ", "-");
        try {
            var selector = id + ".recipe[type*='" + pattern + "']," +
                    id + ".recipe[data-search*='" + pattern + "']";
            util.dom.addClass(selector, "found");
        } catch(e) {
            return;
        }

        this.searchInput.value = (selectMatching) ? TS(pattern) : pattern;

        var matching = null;
        util.dom.forEach(id + ".recipe.found", function() {
            if (selectMatching && (this.type == pattern || this.dataset.search == pattern)) {
                selectMatching = false;
                matching = this;
            }
            this.parentNode.parentNode.classList.add("found");
        });


        if (matching) {
            this.clickListener({target: matching}); //omfg it's ugly
        }
    },
    createRecipeDetails: function() {
        var recipeDetails = document.createElement("div");
        recipeDetails.id = "recipe-details";
        recipeDetails.textContent = T("Select recipe");
        return recipeDetails;
    },
    clickListener: function(e) {
        var recipe = e.target.recipe;
        if(!recipe)
            return;

        if (game.controller.modifier.shift) {
            game.chat.linkRecipe(e.target.type);
            return;
        }
        if (game.player.IsAdmin && game.controller.modifier.ctrl) {
            game.controller.creatingCursor(new Entity(0, e.target.type));
            return;
        }

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
        var template = Entity.templates[e.target.type];
        if (template.MoveType == Entity.MT_PORTABLE)
            this.renderRecipe();
        else
            this.renderBuildRecipe(e);
    },
    renderRecipe: function() {
        this.recipeDetails.innerHTML = "";
        this.requirements = null;
        this.slots = [];

        var recipe = this.current.recipe;

        var title = document.createElement("span");
        title.className = "recipe-title";
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
                slot.onclick = game.controller.craft.makeSearch(group);
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
                };
            }
        }

        var slotsWrapper = document.createElement("div");
        slotsWrapper.id = "recipe-slots";
        for(var i = 0, l = slots.length; i < l; i++) {
            slotsWrapper.appendChild(slots[i]);
            this.slots.push(slots[i]);
        }

        var auto = document.createElement("button");
        auto.className = "recipe-auto";
        auto.textContent = T("Auto");
        auto.onclick = function() {
            this.auto();
        }.bind(this);

        var create = document.createElement("button");
        create.className = "recipe-create";
        create.textContent = T("Create");
        create.onclick = this.create.bind(this);

        var all = document.createElement("button");
        all.className = "recipe-craft-all";
        all.textContent = T("Craft all");
        all.onclick = this.craftAll.bind(this);

        var buttons = document.createElement("div");
        buttons.id = "recipe-buttons";
        buttons.appendChild(all);
        buttons.appendChild(auto);
        buttons.appendChild(create);

        var hr = function() {
            this.recipeDetails.appendChild(util.hr());
        }.bind(this);

        this.recipeDetails.appendChild(this.makePreview(this.current.type));
        this.recipeDetails.appendChild(title);
        hr();
        this.renderRequirements(recipe);
        hr();
        this.recipeDetails.appendChild(document.createTextNode(T("Ingredients") + ":"));
        this.recipeDetails.appendChild(ingredients);
        this.recipeDetails.appendChild(slotsWrapper);
        hr();
        this.recipeDetails.appendChild(buttons);
        hr();
        this.recipeDetails.appendChild(Entity.makeDescription(this.current.type));
    },
    renderBuildRecipe: function(e) {
        var recipe = e.target.recipe;
        this.recipeDetails.innerHTML = "";

        var title = document.createElement("span");
        title.className = "recipe-title";
        title.textContent = e.target.title;

        this.blank.type = e.target.type;

        var ingredients = document.createElement("ul");
        var slots = [];
        for(var name in recipe.Ingredients) {
            var ingredient = document.createElement("li");
            var required = recipe.Ingredients[name];
            ingredient.textContent = required + "x " + TS(name.replace("meta-", ""));
            ingredients.appendChild(ingredient);
        }
        var hr = function() {
            this.recipeDetails.appendChild(util.hr());
        }.bind(this);
        var create = document.createElement("button");
        create.className = "recipe-create";
        create.textContent = T("Create");
        create.onclick = this.build.bind(this);

        this.recipeDetails.appendChild(this.makePreview(this.blank.type));
        this.recipeDetails.appendChild(title);
        hr();
        this.requirements = null; //force renderRequirements append new requirements
        this.renderRequirements(recipe);
        this.recipeDetails.appendChild(ingredients);
        hr();
        this.recipeDetails.appendChild(create);
    },
    auto: function(callback) {
        callback = callback || function(item, container) {
            container.dwimCraft(item);
        };
        for (var i in game.containers) {
            var container = game.containers[i];
            var entity = Entity.get(container.id);
            if (entity && entity.belongsTo(game.player) || container.visible) {
                container.items.forEach(function(item) {
                    if (item)
                        callback(item, container);
                });
            }
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

        requirements.appendChild(document.createTextNode(T("Requirements") + ":"));
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
            tool.textContent = T("Tool") + ": " + TS(recipe.Tool);
            tool.title = T("Must be equipped");
            deps.appendChild(tool);
        }

        if (recipe.Equipment) {
            var equipment = document.createElement("li");
            equipment.textContent = T("Equipment") + ": " + TS(recipe.Equipment);
            equipment.title = T("You must be near equipment");
            deps.appendChild(equipment);
        }

        if (recipe.Liquid) {
            var liquid = document.createElement("li");
            liquid.textContent = TS(recipe.Liquid.Type) + ": " + recipe.Liquid.Volume;
            deps.appendChild(liquid);
        }

        requirements.appendChild(deps);

        if (this.requirements)
            util.dom.replace(this.requirements, requirements);
        else
            this.recipeDetails.appendChild(requirements);

        this.requirements = requirements;
    },
    makePreview: function(type) {
        var previewWrapper = document.createElement("div");
        previewWrapper.className = "preview-wrapper";
        var preview = Entity.templates[type].icon();
        preview.id = "item-preview";
        previewWrapper.appendChild(preview);
        return previewWrapper;
    },
};
