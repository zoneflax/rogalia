"use strict";
function Stage() {}

Stage.prototype = {
    name: "",
    start: function(){},
    end: function(){},
    update: function(){},
    draw: function(){},
    sync: function(data) {},
};

Stage.add = function(stage) {
    stage.prototype = Object.create(Stage.prototype);
};
