var game = {
    sendError: function() {
        throw JSON.stringify(arguments);
    },
    sendErrorf: function() {
        throw JSON.stringify(arguments);
    },
};

requirejs([
    "chat/ring",
    "bst/bst",
]);
