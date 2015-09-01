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
    key: function(value) {
        return value.sortOrder();
    },
    add: function (value) {
        if (!value) {
            game.sendError("bst.add: value is null");
            return;
        }
        //create a new item object, place data in
        var key = this.key(value);
        var node = {
            key: key,
            values: [value],
            left: null,
            right: null,
            parent: null,
        }
        //special case: no items in the tree yet
        if (this._root === null) {
            this._root = node;
            return;
        }
        var current = this._root;
        while (true) {
            //if the new value is less than this node's value, go left
            if (key < current.key){
                //if there's no left, then the new node belongs there
                if (current.left === null){
                    node.parent = current;
                    current.left = node;
                    return;
                }
                current = current.left;
                //if the new value is greater than this node's value, go right
            } else if (key > current.key){
                //if there's no right, then the new node belongs there
                if (current.right === null){
                    node.parent = current;
                    current.right = node;
                    return;
                }
                current = current.right;
                //if the new value is equal to the current one, insert to list
            } else {
                var i = this.findIndex(current.values, value)
                if (i != -1)
                    game.sendErrorf("Duplicate in binary tree: %j", value);
                current.values.push(value);
                return;
            }
        }
    },
    findIndex: function(values, value) {
        var id = this.id(value)
        return values.findIndex(function(e) {
            return this.id(e) == id;
        }, this);
    },
    /**
     * Determines if the given value is present in the tree.
     * @param {variant} value The value to find.
     * @return {Boolean} True if the value is found, false if not.
     * @method contains
     */
    contains: function(value){
        var current = this._root;
        //make sure there's a node to search
        var key = this.key(value);
        while(current){
            //if the value is less than the current node's, go left
            if (key < current.key){
                current = current.left;
                //if the value is greater than the current node's, go right
            } else if (key > current.key){
                current = current.right;
                //values are equal, found it!
            } else {
                return this.findIndex(current.values, value) != -1;
            }
        }
        return false;
    },
    remove: function(value) {
        if (!value) {
            game.sendError("bst.remove: value is null")
            return;
        }

        var key = this.key(value);
        var current = this._root;
        while (current) {
            if (key < current.key)
                current = current.left;
            else if (key > current.key)
                current = current.right;
            else {
                var i = this.findIndex(current.values, value);
                if (i != -1) {
                    current.values.splice(i, 1);
                    if (current.values.length == 0)
                        break;
                }
                return;
            }
        }
        if (!current)
            return;
        if (!current.right) {
            this._replace(current, current.left);
        } else if (!current.left)
            this._replace(current, current.right);
        else {
            this._delete(current, current.left);
        }
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
    _delete: function(base, node) {
        if (node.right) {
            this._delete(base, node.right);
        } else {
            base.key = node.key;
            base.values = node.values;
            this._replace(node, node.left);
        }
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
        node.values.forEach(process);
        if (node.right !== null){
            this._inOrder(node.right, process);
        }
    },
    traverse: function(process){
        this._inOrder(this._root, process);
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
        found = node.values.find(predicate);
        if (found)
            return found;;
        if (node.left !== null){
            return this._outOrder(node.left, predicate);
        }
        return null;
    },
    findReverse: function(predicate) {
        return this._outOrder(this._root, predicate);
    },
};
