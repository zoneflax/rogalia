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

        const x = event.pageX - drag.x;
        const y = event.pageY - drag.y;
        target.dataset.x = x;
        target.dataset.y = y;
        target.style.transform = `translate(${x}px, ${y}px)`;
    });

    function dragIgnore(element) {
        if (dragIgnoreTags.indexOf(element.tagName) != -1)
            return true;

        return !document.defaultView.getComputedStyle(element).cursor.includes("default");
    };

};
