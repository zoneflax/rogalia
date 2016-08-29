"use strict";
function DragManager() {
    var dragIgnoreTags = ["INPUT", "TEXTAREA", "BUTTON", "CODE"];

    var drag = {
        target: null,
        dx: 0,
        dy: 0,
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
	drag.dx = event.pageX - target.offsetLeft;
        drag.dy = event.pageY - target.offsetTop;
    });

    window.addEventListener("mouseup", function() {
        drag.target = null;
    });

    window.addEventListener("mousemove", function(event) {
        if (!drag.target)
            return;
        if (drag.target.ondrag) {
            drag.target.ondrag(event, drag);
            return;
        }
	drag.target.style.left = event.pageX - drag.dx + "px";
	drag.target.style.top = event.pageY - drag.dy + "px";
    });

    function dragIgnore(element) {
        if (dragIgnoreTags.indexOf(element.tagName) != -1)
            return true;

        return !getComputedStyle(element).cursor.includes("default");
    };

};
