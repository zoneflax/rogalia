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
        const target = drag.target
        if (!target)
            return;

        const {x, y} = snap(target, event.pageX - drag.x, event.pageY - drag.y);
        target.dataset.x = x;
        target.dataset.y = y;
        target.style.transform = `translate(${x}px, ${y}px)`;
    });

    function snap(element, x, y) {
        const pos = {x, y}
        const closest = {
            dx: +Infinity,
            dy: +Infinity,
        }
        const margin = 2;
        const threshold = 10;
        const panels = Object.values(game.panels).concat([
            {
                x: game.offset.x,
                y: game.offset.y,
                width: game.world.offsetWidth - margin,
                height: game.world.offsetHeight - margin,
                visible: true,
            },
            {
                x: 0,
                y: 0,
                width: window.innerWidth - margin,
                height: window.innerHeight - margin,
                visible: true,
            },
        ])
        panels.forEach(function(panel) {
            if (panel.element == element || !panel.visible) {
                return;
            }

            if ((y < panel.y + panel.height + threshold) && (y + element.clientHeight > panel.y - threshold)) {
                {
                    const snapX = panel.x + panel.width + margin;
                    const dx = Math.abs(snapX - x);
                    if (dx < threshold && dx < closest.dx) {
                        closest.dx = dx;
                        pos.x = snapX;
                    }
                }
                {
                    const snapX = panel.x;
                    const dx = Math.abs(snapX - x);
                    if (dx < threshold && dx < closest.dx) {
                        closest.dx = dx;
                        pos.x = snapX;
                    }
                }
                {
                    const snapX = panel.x - element.clientWidth - margin;
                    const dx = Math.abs(snapX - x);
                    if (dx < threshold && dx < closest.dx) {
                        closest.dx = dx;
                        pos.x = snapX;
                    }
                }
                {
                    const snapX = panel.x + panel.width - element.clientWidth;
                    const dx = Math.abs(snapX - x);
                    if (dx < threshold && dx < closest.dx) {
                        closest.dx = dx;
                        pos.x = snapX;
                    }
                }
            }
            if ((x < panel.x + panel.width + threshold) && (x + element.clientWidth > panel.x - threshold)) {
                {
                    const snapY = panel.y + panel.height + margin;
                    const dy = Math.abs(snapY - y);
                    if (dy < threshold && dy < closest.dy) {
                        closest.dy = dy;
                        pos.y = snapY;
                    }
                }
                {
                    const snapY = panel.y;
                    const dy = Math.abs(snapY - y);
                    if (dy < threshold && dy < closest.dy) {
                        closest.dy = dy;
                        pos.y = snapY;
                    }
                }
                {
                    const snapY = panel.y - element.clientHeight - margin;
                    const dy = Math.abs(snapY - y);
                    if (dy < threshold && dy < closest.dy) {
                        closest.dy = dy;
                        pos.y = snapY;
                    }
                }
                {
                    const snapY = panel.y + panel.height - element.clientHeight;
                    const dy = Math.abs(snapY - y);
                    if (dy < threshold && dy < closest.dy) {
                        closest.dy = dy;
                        pos.y = snapY;
                    }
                }
            }
        });
        return pos;
    }

    function dragIgnore(element) {
        if (dragIgnoreTags.indexOf(element.tagName) != -1)
            return true;

        return !document.defaultView.getComputedStyle(element).cursor.includes("default");
    };

};
