/* global describe, it, Quadtree, chai, BBox */

var assert = chai.assert;

describe("Quadtree", function() {

    it("should has correct bbox (rect)", function() {
        let got = makeRectEntity().bbox();
        let expect = new BBox(2, 2, 16, 16);
        assert.equal(got.x, expect.x, "x");
        assert.equal(got.y, expect.y, "y");
        assert.equal(got.width, expect.width, "width");
        assert.equal(got.height, expect.height, "height");
    });

    it("should has correct bbox (circle)", function() {
        let got = makeCircleEntity().bbox();
        let expect = new BBox(2, 2, 16, 16);
        assert.equal(got.x, expect.x, "x");
        assert.equal(got.y, expect.y, "y");
        assert.equal(got.width, expect.width, "width");
        assert.equal(got.height, expect.height, "height");
    });

    it("should has correct bbox centeredAtPoint", function() {
        let got = BBox.centeredAtPoint({x: 10, y: 10}, 16, 16);
        let expect = new BBox(2, 2, 16, 16);
        assert.equal(got.x, expect.x, "x");
        assert.equal(got.y, expect.y, "y");
        assert.equal(got.width, expect.width, "width");
        assert.equal(got.height, expect.height, "height");
    });


    it("should insert and find", function() {
        const [qtree, entity] = prepareSingle();
        assert(qtree.find(qtree, (x) => x == entity));
        assert.equal(qtree.length, 1);
    });

    it("should insert and find in bbox", function() {
        const [qtree, entity] = prepareSingle();
        assert(qtree.find(new BBox(5, 5, 20, 20), (x) => x == entity));
    });

    it("shouldn't find in different bbox", function() {
        const [qtree, entity] = prepareSingle();
        assert.isNotOk(qtree.find(new BBox(20, 20, 20, 20), (x) => x == entity));
    });

    it("should insert and remove", function() {
        const [qtree, entity] = prepareSingle();
        qtree.remove(entity);
        assert.isNotOk(qtree.find(qtree, (x) => x == entity));
        assert.equal(qtree.length, 0);
    });


    function prepareSingle() {
        const qtree = new Quadtree(0, 0, 1000, 1000);
        const entity = makeRectEntity();
        qtree.insert(entity);
        return [qtree, entity];
    }

    function makeRectEntity() {
        const entity = new Entity();
        entity.x = 10;
        entity.y = 10;
        entity.Width = 16;
        entity.Height = 16;
        return entity;
    }

    function makeCircleEntity() {
        const entity = new Entity();
        entity.x = 10;
        entity.y = 10;
        entity.Radius = 8;
        return entity;
    }
});
