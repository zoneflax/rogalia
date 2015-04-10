dict.init = function() {
    window.TT = function(text, args) {
        text = T(text);
        text.match(/{[^}]+}/g).forEach(function(v) {
            text = text.replace(v, T(args[v.slice(1, -1)]));
        });
        return text;
    };
    window.TS = function(text) {
        return T(text, true);
    };

    if (!game.config.language.Russian) {
        dict.update = function(){};
        window.T = function(text) {
            return text;
        };

        return;
    }
    window.T = function(text, symbol) {
        if (game.config.language.Russian) {
            var info = Items[text];
            if (info && info.name.ru)
                return info.name.ru;
        }
        if (symbol)
            text = util.symbolToString(text);
        return dict[text] || text;
    };

    dict.update = function(elem) {
        var list = {};
        function update(elem) {
            if (elem.nodeType == 3) {
                var text = elem.textContent;
                elem.textContent = T(text);
                list[text] = elem.textContent;
            } else if (elem.childNodes.length) {
                [].forEach.call(elem.childNodes, update);
            }
        }
        update(elem || document.body);
        // console.log(JSON.stringify(list));
    };

    dict.update();
}
dict.getTranslations = function() {
    for (var type in Entity.templates) {
        var entity = Entity.templates[type];

        var title = entity.title.replace(/\[.*$/, "");
        if (!dict[title])
            dict[title] = "";

        for (var action in entity.getActions()) {
            action = util.symbolToString(action);
            if (action in dict)
                continue;
            dict[action] = "";
        }
    }
    for (type in Entity.recipes) {
        var recipe = Entity.recipes[type];
        for (var kind in recipe.Ingredients) {
            kind = util.symbolToString(kind);
            if (!dict[kind])
                dict[kind] = "";
        }
    }
    var textarea = document.createElement("textarea");
    textarea.value = JSON.stringify(dict);
    var panel = new Panel("Translations", "translations", [textarea]);
    panel.show();
};
