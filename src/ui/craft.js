/* global game, dom, T, TS, Panel, ParamBar, playerStorage, Skills, util, ContainerSlot, Container, _ */

"use strict";
class Craft {
    constructor() {
        this.visibleGroups = {};
        this.buildButton = null;
        this.selected = null;
        this.slots = [];
        this.current = null;
        this.recipes = {};

        this.useCustomSlots = playerStorage.getItem("craft.useCustomslots");

        this.ingredientCounters = {};
        this.availableIngredients = {};

        this.craftButton = dom.button(T("Create"), "", () => this.create());
        this.crafting = false;

        this.searchInput = null;
        this.searchEntity = null;
        this.filters = this.initFilters();
        this.lastSearch = playerStorage.getItem("craft.search") || "";

        this.titleElement = dom.div();
        this.ingredientList = dom.div("ingredient-list");

        this.ingredientSlots = null;


        this.recipeDetails = dom.div("#recipe-details", {text : T("Select recipe")});

        this.history = [];
        this.favorites = playerStorage.getItem("craft.favorites") || {};

        this.blank = {
            type: null,
            entity: null,
            panel: null,
            canUse: function(entity) {
                for (var group in this.entity.Props.Ingredients) {
                    if (entity.is(group)) {
                        return true;
                    }
                }
                return false;
            },
            dwim: function(entity) {
                // TODO: handle game.controller.modifier.shift as for containers
                return this.use(entity);
            },
            use: function(entity) {
                if (this.canUse(entity)) {
                    game.network.send("build-add", {blank: this.entity.Id, id: entity.Id});
                    return true;
                }
                // do now allow using item
                return false;
            },
        };

        this.tabs = [
            {
                title: T("by skill"),
                update: (title, contents) => {
                    dom.setContents(contents, this.makeRecipeTree(this.recipesBySkill()));
                    this.repeatSearch();
                },
            },
            {
                title: T("by purpose"),
                update: (title, contents) => {
                    dom.setContents(contents, this.makeRecipeTree(this.recipesByPurpose()));
                    this.repeatSearch();
                },
            },
            {
                id: "favorites",
                title: T("favorites"),
                update: (title, contents) => {
                    dom.setContents(contents, this.makeRecipeTree(this.favorites));
                    this.repeatSearch();
                },
            }
        ];

        this.panel = new Panel(
            "craft",
            "Craft",
            [
                this.makeHeader(),
                dom.hr(),
                dom.tabs(this.tabs),
            ]
        );
        this.panel.hooks.hide = () => this.cleanUp();
        this.panel.hooks.show = () => {
            this.searchInput.focus();
            this.update();
        };

        this.build = (e) => {
            const ghost = new Entity(this.blank.type);
            if (this.current.variant) {
                ghost.Variant = this.current.variant;
            }
            ghost.initSprite();
            game.controller.creatingCursor(ghost, "build");
            this.panel.hide();
        };

        this.repeatSearch();
    }

    initFilters() {
        return [
            {
                name: "craft",
                test: (type) => Entity.templates[type].MoveType == Entity.MT_PORTABLE,
            },
            {
                name: "building",
                test: (type) => Entity.templates[type].MoveType != Entity.MT_PORTABLE,
            },
            {
                name: "available",
                test: (type) => this.safeToCreate(Entity.recipes[type]),
            },
            {
                name: "has-ingredients",
                test: (type) => this.hasIngredients(Entity.recipes[type]),
            }
        ].map(filter => {
            filter.enabled = playerStorage.getItem("craft.filter." + filter.name);
            return filter;
        });
    }

    repeatSearch() {
        this.search(this.searchInput.value, true);
    }

    makeHeader() {
        return dom.wrap("craft-header", [
            this.makeSearchByKeyword(),
            dom.vr(),
            this.makeSearchByIngredient(),
            dom.vr(),
            this.makeSearchFilters(),
        ]);
    }

    moveMiscRecipes(root) {
        for (const groupName in root) {
            const group = root[groupName];
            if (_.size(group) == 1) {
                root[groupName] = group[Object.keys(group)[0]];
                continue;
            }
            let misc = {};
            for (const name in group) {
                const subgroup = group[name];
                if (Entity.miscGroups.includes(name) || _.size(subgroup) == 1) {
                    delete group[name];
                    _.forEach(subgroup, (recipe, type) => {
                        misc[type] = recipe;
                    });
                }
            }
            if (_.size(misc) > 0) {
                root[groupName] = _.merge({misc}, group);
            }
        }
        return root;
    }

    recipesBySkill() {
        const root = Entity.sortedRecipes.reduce((root, [type, recipe]) => {
            root[recipe.Skill][type] = recipe;
            return root;
        }, _.fromPairs(Skills.list.map(skill => [skill, {}])));
        for (const skill in root) {
            if (_.size(root[skill]) == 0) {
                delete root[skill];
                continue;
            }
        }
        return root;
    }

    recipesByPurpose() {
        const prioritize = ["knife"];
        const root = Entity.sortedRecipes.reduce((root, [type, recipe]) => {
            const entity = Entity.templates[type];
            const group = entity.tags.find(tag => Entity.craftGroups.includes(tag)) || "misc";
            const subgroup = prioritize.find(tag => tag == entity.Group) ||
                  entity.tags.find(tag => !Entity.craftGroups.includes(tag)) ||
                  "misc";
            const node = root[group][subgroup] || {};
            node[type] = recipe;
            root[group][subgroup] = node;
            return root;
        }, _.merge(_.fromPairs(Entity.craftGroups.map(group => [group, {}])), {misc: {}}));

        return this.moveMiscRecipes(root);
    }

    makeRecipeTree(root) {
        const recipeContainer = dom.wrap("recipe-container", T("Select recipe"));
        this.recipeDetails = recipeContainer;
        this.recipes = {};
        this.root = this.makeNode(root);
        return dom.wrap("recipe-tree-container", [
            dom.scrollable("recipe-tree-root", this.root),
            recipeContainer,
            recipeContainer,
        ]);
    }

    makeNode(tree, flat = false) {
        return dom.wrap("recipe-tree", _.map(tree, (leaf, name) => {
            if ("Ingredients" in leaf) {
                return this.makeRecipe(name, leaf);
            }

            const element = dom.wrap("recipe-subtree", [
                dom.wrap(
                    "recipe-subtree-header",
                    [
                        dom.wrap("recipe-subtree-icon"),
                        TS(name),
                    ],
                    {
                        onclick: () => {
                            element.classList.toggle("expanded");
                        },
                    }
                ),
                this.makeNode(leaf, true),
            ]);
            return element;
        }));
    }

    makeRecipe(type, recipe) {
        const name = TS(type);
        const element =  dom.wrap("recipe", name, {
            onclick: () => {
                if (game.controller.modifier.shift) {
                    game.chat.linkRecipe(type);
                    return;
                }
                if (game.player.IsAdmin && game.controller.modifier.ctrl) {
                    this.panel.hide();
                    game.controller.newCreatingCursor(type);
                    return;
                }
                this.openRecipe({type, recipe, element});
            }
        });
        if (!this.safeToCreate(recipe)) {
            element.classList.add("unavailable");
        }
        element.dataset.type = type;
        element.dataset.search = TS(type);
        this.recipes[type] = element;
        return element;
    }

    recipe(type) {
        return Entity.recipes[type];
    }

    render(blank) {
        var ingredients = blank.Props.Ingredients;
        var type = blank.Props.Type;
        var recipe = this.recipe(type);
        // if it's an old item which no has no recipe
        if (!recipe)
            return;
        this.titleElement.textContent = TS(type);

        dom.clear(this.ingredientList);
        var canBuild = true;
        for(var group in ingredients) {
            var has = ingredients[group];
            var required = recipe.Ingredients[group];
            var name = TS(group.replace("meta-", ""));
            var ingredient = ParamBar.makeParam(
                _.truncate(name, {length: 14}),
                {Current: has, Max: required}
            );
            ingredient.title = name;
            canBuild = canBuild && (has == required);
            this.ingredientList.appendChild(ingredient);
        }
        this.buildButton.disabled = !canBuild;
    }

    update() {
        // update blank after server confirmation of ingredient being added
        if (this.blank.entity && this.blank.panel.visible) {
            this.render(this.blank.entity);
        }

        if (this.current && this.panel.visible) {
            const ingredients = game.player.findItems(Object.keys(this.current.recipe.Ingredients));
            if (!_.isEqual(ingredients, this.availableIngredients)) {
                this.openRecipe(this.current);
            }
        }
    }

    updateSearch() {
        if (this.panel.visible) {
            this.repeatSearch();
        }
    }

    open(blank, burden) {
        this.blank.entity = blank;
        var panel = this.blank.panel = new Panel("blank-panel", "Build");
        panel.entity = blank;

        var slotHelp = dom.div("", {text :  T("Drop ingredients here") + ":"});

        this.slot = dom.div();
        this.slot.classList.add("slot");
        this.slot.build = true;

        var self = this;
        var recipe = this.recipe(blank.Props.Type);
        var auto = dom.button(T("Auto"), "build-auto", function() {
            var list = [];
            var items = [];
            game.controller.iterateContainers(function(item) {
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
        });

        this.buildButton = dom.button(T("Build"), "build-button", function(e) {
            game.network.send("build", {id: blank.Id});
            panel.hide();
        });

        panel.setContents([
            this.titleElement,
            dom.hr(),
            slotHelp,
            this.slot,
            dom.hr(),
            this.ingredientList,
            dom.wrap("buttons", [
                auto,
                this.buildButton,
            ]),
        ]);

        this.render(blank);
        panel.show();

        if (burden) {
            this.blank.use(burden);
        }
    }

    cleanUp() {
        this.slots.forEach(slot => slot.element.cleanUp());
    }

    makeSearchByKeyword() {
        var input = dom.tag("input");
        input.placeholder = T("search");
        input.addEventListener("keyup", (event) => this.searchHandler(event));
        input.value = this.lastSearch;
        input.classList.add("search-input");

        this.searchInput = input;

        const clear =  dom.button("×", "clear-search", () => {
            this.search();
            input.value = "";
            input.focus();
        });
        clear.title = T("Clear search");

        return dom.wrap("search-by-keyword", [
            T("Search by keyword"),
            dom.wrap("search-label", [input, clear]),
        ]);
    }

    makeSearchByIngredient() {
        return dom.wrap("search-by-ingredient", [
            this.makeSearchSlot(),
            T("Search by ingredient"),
        ]);
    }

    makeSearchFilters() {
        return dom.wrap("search-filters", [
            T("Filters") + ":",
            dom.wrap(
                "filters",
                this.filters.map((filter) => {
                    const element = dom.div("search-filter", {title: T("Only") + " " + TS(filter.name)});
                    element.style.backgroundImage = `url(assets/icons/craft/${filter.name}.png)`;

                    if (filter.enabled)
                        element.classList.add("enabled");

                    element.onclick = () => {
                        filter.enabled = element.classList.toggle("enabled");
                        this.repeatSearch();
                    };
                    filter.element = element;
                    return element;

                })
            ),
        ]);
    }

    makeSearchSlot() {
        const slot = dom.wrap("slot plus");
        slot.title = T("Search by ingredient");
        slot.canUse = () => true;
        slot.use = (entity) => {
            dom.clear(slot);
            this.searchEntity = entity;
            slot.classList.remove("plus");
            slot.appendChild(entity.icon());
            this.repeatSearch();
            return true;
        };
        slot.onmousedown = () => {
            if (!game.controller.cursor.isActive()) {
                this.searchEntity = null;
                dom.clear(slot);
                slot.classList.add("plus");
                this.repeatSearch();
            }
        };

        return slot;
    }

    searchHandler(event) {
        if (event.target.value == this.lastSearch) {
            return true;
        }
        this.lastSearch = event.target.value;
        return this.search(event.target.value);
    }

    searchOrHelp(pattern) {
        var help = Craft.help[pattern];
        if (help) {
            // we need to defer panel showing because searchOrHelp will be called from click handler
            // which will focus previous panel
            _.defer(() => new Panel("craft-help", T("Help"), dom.span(help)).show());
            return;
        }

        if (game.stage.name == "main") {
            this.panel.show();
        }

        this.filters.forEach(filter => {
            filter.enabled = false;
            filter.element.classList.remove("enabled");
        });

        if (pattern && pattern.match(/-wall-plan$/)) {
            _.defer(() => game.controller.shop.search(pattern));
        } else {
            if (pattern in this.recipes && this.current) {
                this.history.push(this.current);
            }
            this.search(pattern, true);
        }
    }

    search(pattern = "", selectMatching = false) {
        const re = pattern && new RegExp(_.escapeRegExp(pattern).replace(/-/g, "[- ]"), "i");
        const found = [];
        const traverse = (subtree) => {
            for (const child of subtree.children) {
                child.classList.remove("found");
                child.classList.remove("expanded");
                child.classList.remove("first");
                child.classList.remove("last");
                if (child.classList.contains("recipe-subtree")) {
                    traverse(child.querySelector(".recipe-tree"));
                    continue;
                }
                const type = child.dataset.type;
                let match = true;
                if (re) {
                    match = re.test(type) || re.test(child.dataset.search);
                }
                if (match && this.searchEntity) {
                    const recipe = Entity.recipes[type];
                    match = _.some(recipe.Ingredients, (recipe, kind) => this.searchEntity.is(kind));
                }
                if (match) {
                    match = this.filters.every(({test, enabled}) => !enabled || test(type));
                }

                if (match) {
                    child.classList.add("found");
                    found.push(child);
                }
            }
        };

        traverse(this.root);

        if (!re && !this.searchEntity && this.filters.every(({enabled}) => !enabled)) {
            this.root.classList.remove("searching");
            return;
        }

        this.root.classList.add("searching");

        const value = (selectMatching) ? TS(pattern) : pattern;
        if (this.searchInput.value != value) {
            this.searchInput.value = value;
        }

        found.forEach(element => {
            if (selectMatching && (element.dataset.type == pattern || element.dataset.search == pattern)) {
                selectMatching = false;
                this.openRecipe({type: element.dataset.type, element});
            }
            let parent = element.parentNode;
            while (!parent.classList.contains("recipe-tree-root")) {
                if (parent.classList.contains("recipe-subtree")) {
                    parent.classList.add("found");
                    parent.classList.add("expanded");
                }
                parent = parent.parentNode;
            }
        });

        updateTree(this.root);

        function updateTree(subtree) {
            let last = null;
            let first = null;
            for (const child of subtree.children) {
                if (child.classList.contains("recipe") && child.classList.contains("found")) {
                    if (!first) {
                        first = child;
                    }
                    last = child;
                } else if (child.classList.contains("expanded")) {
                    last = child;
                    if (!first) {
                        first = child;
                    }
                    updateTree(child.lastChild);
                }
            }
            if (first) {
                first.classList.add("first");
            }
            if (last) {
                last.classList.add("last");
            }
        }
    }

    onclick(e) {
        if (!e.target.recipe)
            return;

        this.openRecipe(e.target, true);
    }

    openRecipe({type, recipe = Entity.recipes[type], element}) {
        if (this.current && this.current.element) {
            this.current.element.classList.remove("selected");
        }
        this.current = {type, recipe, element};
        this.cleanUp();
        element.classList.add("selected");
        const template = Entity.templates[type];
        if (template.MoveType == Entity.MT_PORTABLE)
            this.renderRecipe(this.recipeDetails);
        else
            this.renderBuildRecipe(this.recipeDetails);
    }

    renderRecipe(element) {
        this.slots = [];

        const {type, recipe} = this.current;

        this.type = this.current.type;

        this.availableIngredients = game.player.findItems(Object.keys(recipe.Ingredients));
        this.ingredientCounters = {};
        const canCraft = _.reduce(this.availableIngredients, (max, {length: has}, kind) => {
            const required = recipe.Ingredients[kind];
            return Math.min(max, Math.floor(has/required));
        }, +Infinity);

        const repeat = (this.repeatInput) ? Math.max(1, this.repeatInput.value) : 1;
        this.repeatInput = dom.tag("input");
        this.repeatInput.type = "number";
        this.repeatInput.min = 1;
        this.repeatInput.max = canCraft;
        this.repeatInput.value = (canCraft) ? Math.min(repeat, canCraft) : 0;
        this.repeatInput.onchange = () => {
            this.repeatInput.value = Math.min(+this.repeatInput.value, canCraft);
        };

        const controlls = dom.wrap("recipe-controlls", [
            dom.make("a", "<", "less", {
                onclick: () => this.repeatInput.value = Math.max(1, this.repeatInput.value - 1)
            }),
            this.repeatInput,
            dom.make("a", ">", "more", {
                onclick: () => this.repeatInput.value = Math.min(+this.repeatInput.value + 1, canCraft)
            }),
            dom.make("a", "≫", "max", {
                onclick: () => this.repeatInput.value = canCraft
            }),
            this.craftButton,
        ]);

        if (canCraft == 0) {
            controlls.classList.add("disabled");
        }

        dom.setContents(element, [
            this.makeRecipeHeader(type, recipe),
            dom.hr(),
            this.makeIngredients(type, recipe),
            this.makeBackButton(),
            controlls,
            dom.scrollable("recipe-descr", Entity.templates[type].makeDescription()),
        ]);
    }

    makeIngredients(type, recipe) {
        return dom.wrap("recipe-ingredients", [
            dom.wrap("recipe-ingredient-list", _.map(recipe.Ingredients, (required, kind) => {
                return this.makeIngredientCounter(kind, required, recipe.IsBuilding);
            })),
            this.makeIngredientSlots(type, recipe),
            (Entity.templates[type].MoveType == Entity.MT_PORTABLE) && dom.make(
                "button",
                [
                    dom.img("assets/icons/customization.png"),
                ],
                "recipe-toggle-custom",
                {
                    onclick: () => this.toggleCustomSlots(type, recipe),
                }
            ),
        ]);
    }

    updateIngredientCounters(recipe) {
        _.forEach(recipe.Ingredients, (required, kind) => {
            this.updateIngredientCounter(kind, required, recipe.IsBuilding);
        });
    }

    updateIngredientCounter(kind, required, isBuilding) {
        this.ingredientCounters[kind] = dom.replace(
            this.ingredientCounters[kind],
            this.makeIngredientCounter(kind, required, isBuilding)
        );
    }

    makeIngredientCounter(kind, required, isBuilding) {
        const has = this.availableIngredients[kind].length;
        const used = this.slots.reduce((used, slot) => {
            return used +(slot.entity && slot.entity.is(kind));
        }, 0);
        return this.ingredientCounters[kind] = dom.wrap("recipe-ingredient", [
            (this.useCustomSlots && !isBuilding)
                ? dom.span(
                    ` ${used}/${required} `,
                    (used >= required) ? "available" : ""
                ) : required + "x ",
            this.makeLink(kind),
            dom.span(
                ` (${has})`,
                (has >= required) ? "available" : "unavailable",
                T("Available")
            ),
        ]);
    }

    makeIngredientSlots(type, recipe) {
        return this.ingredientSlots = (this.useCustomSlots && !recipe.IsBuilding)
            ? this.makeCustomIngredientSlots(type, recipe)
            : this.makeSimpleIngredientSlots(type, recipe);
    }

    makeSimpleIngredientSlots(type, recipe) {
        this.cleanUp();
        this.slots = [];
        return dom.wrap(
            "recipe-ingredient-slots",
            _.map(recipe.Ingredients, (required, kind) => {
                const image = Entity.getPreview(kind, "search-or-help-preview");
                const slot = dom.wrap("slot", image, {
                    title: TS(kind),
                    onclick: () => this.searchOrHelp(kind)
                });
                return slot;
            })
        );
    }

    makeCustomIngredientSlots(type, recipe) {
        this.slots = _.reduce(recipe.Ingredients, (slots, required, kind) => {
            const title = TS(kind);
            return slots.concat(_.times(required, () => {
                const slot = new ContainerSlot({panel: this.panel, entity: {}, inspect: true}, 0);
                const preview = _.find(Entity.templates, (tmpl) => tmpl.is(kind));
                preview.initSprite();
                slot.setPlaceholder(preview.sprite.image.src, title);
                slot.placeholder.classList.add("item-preview");

                slot.element.check = ({entity}) => entity.is(kind);
                slot.element.cleanUp = (event) => {
                    if (slot.entity) {
                        const from = Container.getEntitySlot(slot.entity);
                        from && from.unlock();
                        slot.clear();
                        this.updateIngredientCounter(kind, required, recipe.IsBuilding);
                    }
                };
                slot.element.onmousedown = slot.element.cleanUp;
                slot.element.use = (entity) => {
                    if (this.slots.some(slot => slot.entity == entity)) {
                        return false;
                    }
                    const from = Container.getEntityContainer(entity);
                    if (!from)
                        return false;

                    from.findSlot(entity).lock();
                    slot.set(entity);
                    this.updateIngredientCounter(kind, required, recipe.IsBuilding);
                    return true;
                };
                slot.element.craft = true;
                return slot;
            }));
        }, []);
        return dom.wrap(
            "recipe-ingredient-slots",
            [
                dom.scrollable(
                    "recipe-customs-slots",
                    dom.wrap("slots-wrapper", this.slots.map(slot => slot.element))
                ),
                dom.button(T("Fill"), "recipe-ingredients-fill", () => this.fillIngredients(recipe)),
            ]
        );
    }

    fillIngredients(recipe) {
        _.forEach(recipe.Ingredients, (required, kind) => {
            const used = new Set();
            for (let i = 0; i < required; i++) {
                const entity = this.availableIngredients[kind].find(entity => {
                    if (used.has(entity)) {
                        return false;
                    }
                    if (entity.isContainer() && _.some(entity.Props.Slots)) {
                        return false;
                    }
                    return true;
                });

                if (entity && this.useEntity(entity)) {
                    used.add(entity);
                }
            }
        });
    }

    toggleCustomSlots(type, recipe) {
        this.useCustomSlots = !this.useCustomSlots;
        this.ingredientSlots = dom.replace(this.ingredientSlots, this.makeIngredientSlots(type, recipe));
        this.updateIngredientCounters(recipe);
    }

    renderBuildRecipe(element) {
        const {type, recipe} = this.current;

        this.blank.type = type;
        this.availableIngredients = game.player.findItems(Object.keys(recipe.Ingredients));

        dom.setContents(element, [
            this.makeRecipeHeader(type, recipe),
            dom.hr(),
            this.makeIngredients(type, recipe),
            this.makeBackButton(),
            dom.wrap("recipe-controlls", [
                dom.button(T("Build"), "recipe-create", () => this.build())
            ]),
            dom.scrollable("recipe-descr", Entity.templates[type].makeDescription()),
        ]);
    }

    makeBackButton() {
        const button =  dom.button(T("Back"), "recipe-history-back", () => {
            this.search(this.history.pop().type, true);
        });
        button.disabled = (this.history.length == 0);
        return button;
    }

    create() {
        if (this.crafting) {
            this.cancel();
            return;
        }

        this.crafting = true;
        this.craftButton.textContent = T("Cancel");
        this.craft();
    }

    cancel() {
        this.stop();
        game.network.send("set-dst", {X: game.player.X, Y: game.player.Y});
    }

    stop() {
        this.craftButton.textContent = T("Create");
        this.crafting = false;
        this.cleanUp();
    }

    findIngredients(recipe) {
        return (this.useCustomSlots)
            ? this.findCustomIngredients(recipe)
            : this.autoFindIngredients(recipe);
    }

    findCustomIngredients(recipe) {
        const ingredients = [];
        const success = _.every(recipe.Ingredients, (required, kind) => {
            let found = 0;
            return _.some(this.slots, ({entity}) => {
                if (entity && entity.is(kind)) {
                    ingredients.push(entity.Id);
                    if (++found == required) {
                        return true;
                    }
                }
                return false;
            });
        });
        return success && ingredients;
    }

    autoFindIngredients(recipe) {
        let totalRequired = 0;
        const ingredients = _.flatMap(recipe.Ingredients, (required, kind) => {
            totalRequired += required;
            return this.availableIngredients[kind].slice(0, required);
        });
        if (ingredients.length != totalRequired) {
            return null;
        }
        this.slots = ingredients.map(entity => {
            const slot = Container.getEntitySlot(entity);
            slot.element.cleanUp = () => {
                slot.unlock();
            };
            slot.lock();
            return slot;
        });
        return ingredients.map(entity => entity.Id);
    }

    craft({type, recipe} = this.current) {
        this.fillIngredients(recipe);
        const ingredients = this.findIngredients(recipe);
        if (!ingredients) {
            return;
        }
        const repeat = this.repeatInput.value;
        game.network.send(
            "craft",
            {type, ingredients, variant: this.variant},
            () => {
                this.openRecipe(this.current);
                if (this.crafting && repeat > 1) {
                    this.repeatInput.value = Math.max(1, repeat - 1);
                    setTimeout(() => this.craft(), 100);
                } else {
                    this.stop();
                }
            },
            () => {
                this.stop();
            }
        );
    }

    get variant() {
        return this.current.variant || 0;
    }

    safeToCreate(recipe) {
        if (!recipe.Lvl)
            return true;
        var skill = game.player.Skills[recipe.Skill];
        if (!skill)
            game.error("Skill not found", recipe.Skill);
        return skill.Value.Current >= recipe.Lvl;
    }

    hasIngredients(recipe) {
        return _.every(recipe.Ingredients, (required, kind) => {
            let has = 0;
            for (const entity of game.entities.array) {
                if (entity instanceof Entity && entity.is(kind) && game.player.canUse(entity) && ++has == required) {
                    return true;
                }
            }
            return false;
        });
    }

    makeRequirements(type, recipe) {
        return dom.wrap("recipe-requirements", [
            dom.wrap("recipe-requirements-header", [
                this.makeRecipeTypeIcon(type),
                T("Required") + ": "
            ]),
            dom.wrap("", [
                this.makeSkillRequirementes(recipe),
                this.makeToolRequirementes(recipe),
                this.makeEquipmentRequirementes(recipe),
                this.makeLiquidRequirementes(recipe),
            ]),
        ]);
    }

    makeSkillRequirementes(recipe) {
        if (!recipe.Skill) {
            return null;;
        }

        var safeToCreate = this.safeToCreate(recipe);

        var title = "";
        if (!safeToCreate) {
            if (recipe.IsBuilding)
                title = T("Cannot complete building");
            else
                title = T("High chance of failing");
        }

        var lvl = (recipe.Lvl > 0) ? recipe.Lvl : "";

        return dom.wrap(
            "skill-requirements" + ((safeToCreate) ? "" : " unavailable"),
            T("Skill") + " - " + T(recipe.Skill) + " " + lvl,
            {title}
        );
    }

    makeToolRequirementes(recipe) {
        return recipe.Tool && dom.wrap(
            "skill-requirementes",
            [T("Tool") + " - "].concat(this.makeLinks(recipe.Tool)),
            {title : T("Must be equipped")}
        );
    }

    makeEquipmentRequirementes(recipe) {
        return recipe.Equipment && dom.wrap(
            "equipment-requirementes",
            [T("Equipment") + " - "].concat(this.makeLinks(recipe.Equipment)),
            {title : T("You must be near equipment")}
        );
    }

    makeLiquidRequirementes(recipe) {
        return recipe.Liquid && dom.wrap(
            "liquired-requirementes",
            TS(recipe.Liquid.Type) + " : " + recipe.Liquid.Volume
        );
    }

    makeRecipeHeader(type, recipe) {
        return dom.wrap("recipe-header", [
            this.makeRecipePreview(type),
            this.makeTitle(type, recipe),
            this.makeInfo(type),
            this.makeRequirements(type, recipe),
        ]);
    };

    makeRecipePreview(type) {
        const entity = new Entity(type);
        const element = dom.wrap("recipe-preview", entity.icon(), {
            onclick: () => {
                if (!entity.Sprite.Variants) {
                    return;
                }
                entity.Variant = (entity.Variant % entity.Sprite.Variants) + 1;
                this.current.variant = entity.Variant;
                entity.initSprite();
                dom.setContents(element, entity.icon());
            }
        });
        return element;
    }

    makeTitle(type, recipe) {
        const title = TS(type);
        return dom.wrap(
            "recipe-title",
            [
                this.makeToggleFavorite(type),
                title,
                recipe.Output && ` (x${recipe.Output})`,
            ],
            {
                title,
                onclick: () => {
                    if (game.controller.modifier.shift) {
                        game.chat.linkRecipe(type);
                    }
                },
            }
        );
    }

    makeRecipeTypeIcon(type) {
        const icon = (Entity.templates[type].MoveType == Entity.MT_PORTABLE)
              ? "craft"
              : "building";
        return dom.img(`assets/icons/craft/${icon}.png`, "recipe-type-icon");
    }

    makeToggleFavorite(type) {
        const active = (this.favorites[type]) ? " active" : "";
        const icon = dom.wrap("recipe-toggle-favorite" + active, "★", {
            onclick: () => {
                icon.classList.toggle("active");
                this.toggleFavorite(type);
            },
        });
        return icon;
    }

    makeInfo(type) {
        const tmpl = Entity.templates[type];
        return dom.wrap("recipe-info", [
            tmpl.Armor && dom.wrap("", [
                T("Base armor") + ": " + tmpl.Armor
            ]),
            tmpl.Damage && dom.wrap("", [
                T("Base damage") + ": " + tmpl.Damage,
                tmpl.Ammo && dom.wrap("", T("Ammo") + ": " + T(tmpl.Ammo.Type)),
            ]),
            tmpl.EffectiveParam && tmpl.Lvl > 1 && dom.wrap(
                tmpl.nonEffective() ? "unavailable" : "",
                T(tmpl.EffectiveParam) + ": " + tmpl.Lvl
            ),
        ]);
    }

    makeLink(item) {
        if(!item) {
            return null;
        }
        var title = TS(item).toLocaleLowerCase();
        var link = dom.link("", title, "link-item");
        link.title = title;
        link.onclick = () => {
            this.searchOrHelp(item);
        };
        return link;
    }

    makeLinks(s) {
        return (s)
            ? util.intersperse(s.split(",").map(x => this.makeLink(x)), ", ")
            : [];
    }

    dwim(slot) {
        if (!this.panel.visible) {
            return false;
        }

        if (slot.locked) {
            console.warn("dwimCraft: got locked slot");
            return false;
        }

        if (!slot.entity) {
            console.warn("dwimCraft: got empty slot");
            return false;
        }

        const entity = slot.entity;

        // skip non-empty containers
        if (entity.isContainer() && _.some(entity.Props.Slots)) {
            return false;
        }

        return this.useEntity(entity);
    }

    useEntity(entity) {
        return this.slots.some(slot =>  {
            if (slot.entity) {
                return false;
            }
            const {check, use} = slot.element;
            return check({entity}) && use(entity);
        });
    }

    save() {
        this.filters.forEach(({name, enabled}) => {
            playerStorage.setItem("craft.filter." + name, enabled);
        });
        playerStorage.setItem("craft.search", this.searchInput.value);
        playerStorage.setItem("craft.favorites", this.favorites);
        playerStorage.setItem("craft.useCustomslots", this.useCustomSlots);
    }

    toggleFavorite(type) {
        if (this.favorites[type]) {
            delete this.favorites[type];
        } else {
            this.favorites[type] = Entity.recipes[type];
        }
        const tab = this.tabs.find(tab => tab.id == "favorites");
        if (tab.isActive()) {
            tab.activate();
        }
    }
}
