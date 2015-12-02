define(["../../lib/binary-search-tree.js"], function () {
    function Value(n) {
        this.Id = n;
        this.compare = function(to) {
            if (this == to) {
                return 0;
            }
            return (this.Id >= to.Id) ?  +1 : -1;
        };
    };
    var a = new Value(1);
    var b = new Value(2);
    var c = new Value(3);

    function makeTree() {
        var tree = new BinarySearchTree();
        [b, a, c].forEach(function(v) {
            v._bst = null;
            tree.add(v);
        });
        return tree;
    }

    function array(values) {
        return values.map(function(value) {
            return value.Id;
        });
    };

    function assertEqual(accert, tree, values) {
        accert.deepEqual(array(tree.toArray()), array(values));
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

    QUnit.test("bst.remove1000", function(accert) {
        var tree = new BinarySearchTree();
        var values = Array.apply(null, {length: 1000}).map(function(_, i) {
            return new Value(i);
        });
        values.forEach(tree.add.bind(tree));
        assertEqual(accert, tree, values);
    });

    QUnit.test("bst.addAndRemove", function(accert) {
        var tree = new BinarySearchTree();
        var values = Array.apply(null, {length: 1000}).map(function(_, i) {
            return new Value(i);
        });
        values.slice(0, 500).forEach(tree.add.bind(tree));
        values.slice(250, 500).forEach(tree.remove.bind(tree));
        values.slice(250, 1000).forEach(tree.add.bind(tree));
        assertEqual(accert, tree, values);
    });
});
