"use strict";
function HashTable(data) {
    this.hash = {};
    this.table = [];
    if (data) {
        for (var key in data) {
            this.set(key, data[key]);
        }
    }
}

HashTable.prototype = {
    hash: null,
    table: null,
    get length() {
        return this.table.length;
    },
    has: function(key) {
        return this.get(key) != undefined;
    },
    get: function(key) {
        return this.hash[key];
    },
    set: function(key, value) {
        this.remove(key);
        this.hash[key] = value;
        this.table.push(value);
    },
    remove: function(key) {
        var old = this.hash[key];
        if (old) {
            var i = this.table.findIndex(function(item) {
                return item === old;
            });
            this.table.splice(i, 1);
        }
        delete this.hash[key];

    },
    forEach: function(callback) {
        this.table.forEach(callback);
    },
    every: function(predicate) {
        return this.table.every(predicate);
    },
    some: function(predicate) {
        return this.table.some(predicate);
    },
    filter: function(predicate) {
        return this.table.filter(predicate);
    },
    map: function(predicate) {
        return this.table.map(predicate);
    },
}
