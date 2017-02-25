/* global game */

"use strict";
function DragManager() {
    var dragIgnoreTags = ["INPUT", "TEXTAREA", "BUTTON", "CODE"];

    var drag = {
        target: null,
        x: 0,
        y: 0,
    };

    window.addEventListener("mousedown", function(event) {
        var target = event.target.closest(".draggable");
        if (!target)
            return;

        var checking = event.target;
        while(checking && checking != target) {
            if (dragIgnore(checking))
                return;
            checking = checking.parentNode;
        };

        drag.target = target;
        drag.x = event.pageX - parseInt(target.dataset.x || 0);
        drag.y = event.pageY - parseInt(target.dataset.y || 0);
    });

    window.addEventListener("mouseup", function() {
        drag.target = null;
    });

    window.addEventListener("mousemove", function(event) {
        const target = drag.target;
        if (!target)
            return;

        const {x, y} = snap(target, event.pageX - drag.x, event.pageY - drag.y);
        target.dataset.x = x;
        target.dataset.y = y;
        target.style.left = x + "px";
        target.style.top = y + "px";
        // target.style.transform = `translate(${x}px, ${y}px)`;
    });

    function dragIgnore(element) {
        if (dragIgnoreTags.indexOf(element.tagName) != -1)
            return true;

        return !document.defaultView.getComputedStyle(element).cursor.includes("default");
    }

    function snap(element, x, y, threshold = 10, margin = 2) {
        const pos = {x, y};
        const closest = {
            dx: +Infinity,
            dy: +Infinity,
        };
        const width = element.clientWidth;
        const height = element.clientHeight;
        Object.values(game.panels)
            .filter(panel => panel.visible && panel.element != element && panel.canSnap)
            .concat([
                {
                    x: game.offset.x,
                    y: game.offset.y,
                    width: game.world.offsetWidth - margin,
                    height: game.world.offsetHeight - margin,
                },
                {
                    x: 0,
                    y: 0,
                    width: window.innerWidth - margin,
                    height: window.innerHeight - margin,
                },
            ]).forEach(function(panel) {
                if ((y < panel.y + panel.height + threshold) && (y + height > panel.y - threshold)) {
                    [closest.dx, pos.x] = edge(panel.x + panel.width + margin, x, closest.dx, pos.x);
                    [closest.dx, pos.x] = edge(panel.x, x, closest.dx, pos.x);
                    [closest.dx, pos.x] = edge(panel.x - width - margin, x, closest.dx, pos.x);
                    [closest.dx, pos.x] = edge(panel.x + panel.width - width, x, closest.dx, pos.x);
                }
                if ((x < panel.x + panel.width + threshold) && (x + width > panel.x - threshold)) {
                    [closest.dy, pos.y] = edge(panel.y + panel.height + margin, y, closest.dy, pos.y);
                    [closest.dy, pos.y] = edge(panel.y, y, closest.dy, pos.y);
                    [closest.dy, pos.y] = edge(panel.y - height - margin, y, closest.dy, pos.y);
                    [closest.dy, pos.y] = edge(panel.y + panel.height - height, y, closest.dy, pos.y);
                }
            });
        return pos;

        function edge(snap, p, closest, pos) {
            const delta = Math.abs(snap - p);
            return (delta < threshold && delta < closest)
                ? [delta, snap]
                : [closest, pos];
        }
    }
};
