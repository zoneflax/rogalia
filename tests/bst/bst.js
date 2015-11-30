define(["../../js/lib/binary-search-tree.js"], function () {

    function Value(n) {
        this.n = n;
        this.compare = function(to) {
            return this.n - to.n;
        };
    };
    var a = new Value(1);
    var b = new Value(2);
    var c = new Value(3);

    function makeTree() {
        var tree = new BinarySearchTree();
        [b, a, c].forEach(tree.add.bind(tree));
        return tree;
    }

    function array(values) {
        return values.map(function(value) {
            return value.n;
        });
    };

    function assertEqual(accert, tree, values) {
        accert.deepEqual(array(values), array(tree.toArray()));
    }

    QUnit.test("bst.add", function(accert) {
        var tree = makeTree();
        assertEqual(accert, tree, [a, b, c]);
    });

    QUnit.test("bst.remove", function(accert) {
        var tree = makeTree();
        tree.remove(b);
        assertEqual(accert, tree, [a, c]);
    });
});
