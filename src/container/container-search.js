/* global dom, T, ContainerSlot, Panel, Vendor */

"use strict";

class ContainerSearch {
    constructor(container) {
        const name = dom.tag("input");
        name.placeholder = T("Name");
        name.classList.add("search-name");

        const minQuality = dom.tag("input");
        minQuality.type = "number";
        minQuality.value = 1;
        minQuality.min = 1;

        const maxQuality = dom.tag("input");
        maxQuality.type = "number";
        maxQuality.value = 100;
        maxQuality.min = 1;


        const results = dom.wrap("slots-wrapper");

        const search = () => {
            const re = new RegExp(_.escapeRegExp(name.value), "i");
            const found = container.filter(entity => {
                return entity.Quality >= minQuality.value &&
                    entity.Quality <= maxQuality.value &&
                    (re.test(entity.title) || re.test(entity.Type));
            });
            dom.setContents(results, found.sort(Vendor.sort.byType).map((entity, i) => {
                const slot = new ContainerSlot(container, i);
                slot.set(entity);
                return slot.element;
            }));
        };

        name.onkeyup = search;
        minQuality.onkeyup = search;
        maxQuality.onkeyup = search;

        const panel = new Panel("container-item-search", T("Search") + " - " + T(container.name), [
            dom.wrap("container-search-header", [
                name,
                dom.make("label", [
                    T("Quality"), ":", minQuality, " - ", maxQuality,
                ]),
            ]),
            dom.hr(),
            dom.scrollable("container-search-results", results),
        ]).setTemporary(true).show();

        search();
        name.focus();

        ContainerSearch.update = () => {
            if (panel.visible) {
                search();
            }
        };
    }

    static update() {
        // implementation set in constructor()
    }
}
