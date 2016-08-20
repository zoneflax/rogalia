"use strict";
/*
 * Binary Search Tree implementation in JavaScript
 * Copyright (c) 2009 Nicholas C. Zakas
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 * A binary search tree implementation in JavaScript. This implementation
 * does not allow duplicate values to be inserted into the tree, ensuring
 * that there is just one instance of each value.
 * @class BinarySearchTree
 * @constructor
 */
function BinarySearchTree() {
    /**
     * Pointer to root node in the tree.
     * @property _root
     * @type Object
     * @private
     */
    this._root = null;
}
BinarySearchTree.prototype = {
    //restore constructor
    constructor: BinarySearchTree,
    //-------------------------------------------------------------------------
    // Private members
    //-------------------------------------------------------------------------
    /**
     * Appends some data to the appropriate point in the tree. If there are no
     * nodes in the tree, the data becomes the root. If there are other nodes
     * in the tree, then the tree must be traversed to find the correct spot
     * for insertion.
     * @param {variant} value The data to add to the list.
     * @return {Void}
     * @method add
     */
    id: function(value) {
        return value.Id;
    },
    get length () {
        return this.size();
    },
    add: function (value) {
        // console.log("add", value.Id);
        if (!value) {
            game.sendError("bst.add: value is null");
            return;
        }
        if (value._bst) {
            console.error(value.Id, value.Name, "is already in tree");
            return;
        }
        //create a new item object, place data in
        var node = {
            value: value,
            left: null,
            right: null,
            parent: null,
        };
        value._node = node;
        //special case: no items in the tree yet
        if (this._root === null) {
            this._root = node;
            return;
        }
        var current = this._root;
        while (true) {
            //if the new value is less than this node's value, go left
            var compare = value.compare(current.value);
            if (compare < 0) {
                //if there's no left, then the new node belongs there
                if (current.left === null){
                    node.parent = current;
                    current.left = node;
                    return;
                }
                current = current.left;
                //if the new value is greater than this node's value, go right
            } else if (compare > 0) {
                //if there's no right, then the new node belongs there
                if (current.right === null){
                    node.parent = current;
                    current.right = node;
                    return;
                }
                current = current.right;
                //if the new value is equal to the current one, insert to list
            } else {
                game.sendErrorf("Duplicate in binary tree: %d", value.Id);
                return;
            }
        }
    },
    /**
     * Determines if the given value is present in the tree.
     * @param {variant} value The value to find.
     * @return {Boolean} True if the value is found, false if not.
     * @method contains
     */
    contains: function(value){
        return !!this._find(value);
    },
    _find: function(value) {
        var current = this._root;
        //make sure there's a node to search
        while (current) {
            var compare = value.compare(current.value);
            //if the value is less than the current node's, go left
            if (compare < 0){
                current = current.left;
                //if the value is greater than the current node's, go right
            } else if (compare > 0){
                current = current.right;
                //values are equal, found it!
            } else {
                return current;
            }
        }
        return null;
    },
    remove: function(value) {
        if (!value) {
            game.sendError("bst.remove: value is null");
            return;
        }
        var node = value._node;
        if (!node)
            return;
        // console.log("remove", value.Id);
        value._node = null;
        this._removeNode(node);

        // I have no fucking idea why sometimes _find() cannot actually find node
        // when it's really is in tree

        // return;
        // var node = this._find(value);
        // if (node == null) {
        //     console.log("not found", value.Id, value.Name, value._node);
        //     return;
        // }
        // this._removeNode(node);
    },
    _removeNode: function(node) {
        if (node.left == null && node.right == null)
            this._replace(node, null);
        else if (node.right == null)
            this._replace(node, node.left);
        else if (node.left == null)
            this._replace(node, node.right);
        else
            this._delete(node);
    },
    _replace: function(node, replace) {
        var parent = node.parent;
        if (parent) {
            if (parent.left == node)
                parent.left = replace;
            else
                parent.right = replace;
        } else {
            this._root = replace;
        }
        if (replace)
            replace.parent = parent;
    },
    _delete: function(node) {
        var pred = node.left;
        while (pred.right)
            pred = pred.right;
        var temp = pred.value;
        pred.value = node.value;
        node.value = temp;
        temp._node = node;
        this._removeNode(pred);
    },
    /**
     * Returns the number of items in the tree. To do this, a traversal
     * must be executed.
     * @return {int} The number of items in the tree.
     * @method size
     */
    size: function(){
        var length = 0;
        this.traverse(function(node){
            length++;
        });
        return length;
    },
    /**
     * Converts the tree into an array.
     * @return {Array} An array containing all of the data in the tree.
     * @method toArray
     */
    toArray: function(){
        var result = [];
        this.traverse(function(value) {
            result.push(value);
        });
        return result;
    },
    /**
     * Converts the list into a string representation.
     * @return {String} A string representation of the list.
     * @method toString
     */
    toString: function(){
        return this.toArray().toString();
    },
    /**
     * Traverses the tree and runs the given method on each node it comes
     * across while doing an in-order traversal.
     * @param {Function} process The function to run on each node.
     * @return {void}
     * @method traverse
     */
    _inOrder: function(node, process) {
        if (!node)
            return;
        if (node.left !== null) {
            this._inOrder(node.left, process);
        }
        process(node.value);
        if (node.right !== null){
            this._inOrder(node.right, process);
        }
    },
    traverse: function(process){
        this._inOrder(this._root, process);
    },
    forEach: function(process) {
        return this.traverse(process);
    },
    _outOrder: function(node, predicate) {
        if (!node)
            return null;

        var found = null;
        if (node.right !== null) {
            found = this._outOrder(node.right, predicate);
            if (found)
                return found;
        }
        if (predicate(node.value))
            return node.value;
        if (node.left !== null){
            return this._outOrder(node.left, predicate);
        }
        return null;
    },
    findReverse: function(predicate) {
        return this._outOrder(this._root, predicate);
    },
};
