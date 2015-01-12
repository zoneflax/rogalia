function Build() {
    this.visibleGroups = {};
    this.buildButton = null;
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

    /* * * * * */
    this.filter = function(recipe) {
        return recipe.IsBuilding;
    };
    this.searchField = this.createSearchField();
    this.list = this.createList(this.filter);
    this.recipe = function(type) {
        return Entity.Recipes[type];
    },
    this.render = function(blank) {
        var ingredients = blank.Props.Ingredients;
        var type = blank.Props.Type;
        var recipe = this.recipe(type);
        // if it's an old item which no has no recipe
        if (!recipe)
            return;
        this.titleElement.textContent = util.symbolToString(type);

        this.ingredientsList.innerHTML = "";
        var canBuild = true;
        for(var group in ingredients) {
            var has = ingredients[group];
            var required = recipe.Ingredients[group];
            var name = TS(group.replace("meta-", ""));
            var ingredient = Stats.prototype.createParam(name, {Current: has, Max: required});
            canBuild = canBuild && (has == required)
            this.ingredientsList.appendChild(ingredient);
        }
        this.buildButton.disabled = !canBuild;
    }
    this.update = function() {
        if (this.blank.entity)
            this.render(this.blank.entity);
    }

    this.updateVisibility = function() {
        var panel = this.blank.panel;
        var e = this.blank.entity;
        if (panel && e && !game.player.isNear(e)) {
            panel.hide();
        }
    }

    this.open = function(blank, burden) {
        this.blank.entity = blank;

        var slotHelp = document.createElement("div");
        slotHelp.textContent = "Drop ingredients here:";

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
            for (var i in game.containers) {
                var container = game.containers[i];
                container.visible && container.items.forEach(function(item) {
                    if (item)
                        items.push(item.entity);
                });
            }
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
                game.network.send("build-add", {Blank: blank.Id, List: list})
        }

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

        this.blank.panel.replace([
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
    }

    /* * * * * * * * */

    this.titleElement = document.createElement("div");
    this.ingredientsList = document.createElement("ul");
    this.ingredientsList.className = "ingredients-list";

    this.recipeDetails = this.createRecipeDetails();

    this.build = function(e) {
        game.controller.creatingCursor(this.blank.type, "build");
        this.panel.hide();
    }.bind(this);


    this.panel = new Panel(
        "build",
        "Build",
        [this.searchField, this.list, this.recipeDetails],
        function(e) {
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

            this.recipeDetails.innerHTML = "";

            var title = document.createElement("span");
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
            this.recipeDetails.appendChild(title);
            hr();
            var preview = Entity.templates[this.blank.type].icon();
            this.recipeDetails.appendChild(preview);
            hr();
            this.requirements = null; //force renderRequirements append new requirements
            this.renderRequirements(recipe);
            this.recipeDetails.appendChild(ingredients);


            var create = document.createElement("button");
            create.className = "recipe-create";
            create.textContent = T("Create");
            create.onclick = this.build.bind(this);

            this.recipeDetails.appendChild(create);
        }.bind(this)
    );
    this.panel.element.style.minWidth = "500px";
}

util.extend(Build, Craft);
