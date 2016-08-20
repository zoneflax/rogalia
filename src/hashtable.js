"use strict";
function HashTable(data) {
    this.hash = {};
    this.array = [];
    if (data) {
        for (var key in data) {
            this.set(key, data[key]);
        }
    }
}

HashTable.prototype = {
    hash: null,
    array: null,
    get length() {
        return this.array.length;
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
        this.array.push(value);
    },
    remove: function(key) {
        var old = this.hash[key];
        if (old) {
            var i = this.array.findIndex(function(item) {
                return item === old;
            });
            this.array.splice(i, 1);
        }
        delete this.hash[key];

    },
    forEach: function(callback) {
        _.forEach(this.array, callback);
    },
    every: function(predicate) {
        return _.every(this.array, predicate);
    },
    some: function(predicate) {
        return _.some(this.array, predicate);
    },
    filter: function(predicate) {
        return _.filter(this.array, predicate);
    },
    map: function(predicate) {
        return _.map(this.array, predicate);
    },
};
