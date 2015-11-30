define(["../../js/ui/chat/ring.js"], function () {
    var ring = new ChatRing();

    var message = "No one cares about this text";

    // if we push() text into ring then last() must return that message
    QUnit.test("ChatRing.push", function(accert){
        ring.push(message);
        accert.equal(ring.last(), message);
    });

    // now lets pop it, using prev()
    QUnit.test("ChatRing.prev", function(accert) {
        accert.equal(ring.prev(), message);
        // calling it again must not change anything
        accert.equal(ring.prev(), message);
    });

    // we now have exactly one message in the ring, so next() must return nothing
    QUnit.test("ChatRing.next", function(accert) {
        accert.equal(ring.next(), "");
    });

    // okay, let's test several messages
    QUnit.test("ChatRing.multiple-prev", function(accert) {
        ring.push("one");
        ring.push("two");
        ring.push("three");
        accert.equal(ring.prev(), "three");
        accert.equal(ring.prev(), "two");
        accert.equal(ring.prev(), "one");
        accert.equal(ring.prev(), message);
    });

    QUnit.test("ChatRing.multiple-next", function(accert) {
        accert.equal(ring.next(), "one");
        accert.equal(ring.next(), "two");
        accert.equal(ring.next(), "three");
        accert.equal(ring.next(), "");
    });

    // now let's test backup of non-pushed message
    QUnit.test("ChatRing.save", function(accert) {
        ring.push(message);
        var unsaved = "this text was not saved";
        ring.save(unsaved);
        accert.equal(ring.prev(), message);
        accert.equal(ring.next(), unsaved);
        accert.notEqual(ring.last(), unsaved);
    });

});
