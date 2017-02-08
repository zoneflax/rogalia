/* global Point, game, BBox */

"use strict";

class PathNode {
    constructor(point = new Point()) {
        this.point = point;
        this.parent = null;
        this.f = +Infinity;
        this.g = 0;
    }

    get key() {
        return this.point.toString();
    }

    neighbors(step) {
        return PathNode.directions.map(dir => this.point.clone().add(dir.clone().mul(step)));
    }

    costTo(node) {
        return this.addBiomCost(this.distanceTo(node));
    }

    distanceTo(node) {
        return this.addBiomCost(this.point.distanceTo(node.point));
    }

    manhattenDistanceTo(node) {
        return Math.abs(this.point.x - node.point.x) + Math.abs(this.point.y - node.point.y);
    }

    addBiomCost(cost) {
        const cell = game.map.getCell(this.point.x, this.point.y);
        return (cell)
            ? cost / ((cell.biom.Speed + 3)/4)
            : cost;
    }


    path() {
        let path = [this.point];
        let current = this;
        while (current.parent) {
            path.push(current.point);
            current = current.parent;
        }
        return path;
    }

    static collide(point, step, gap = PathNode.gap) {
        const halfStep = step / 2;
        let cell = game.map.getCell(point.x - halfStep, point.y - halfStep);
        if (cell && cell.biom.Blocked)
            return true;

        cell = game.map.getCell(point.x - halfStep, point.y + halfStep);
        if (cell && cell.biom.Blocked)
            return true;

        cell = game.map.getCell(point.x + halfStep, point.y - halfStep);
        if (cell && cell.biom.Blocked)
            return true;

        cell = game.map.getCell(point.x + halfStep, point.y + halfStep);
        if (cell && cell.biom.Blocked)
            return true;

        return game.player.willCollide(point, gap);
    }
}

// PathNode.debug = {};
PathNode.gap = 4;

// PathNode.directions = _.range(0, 2*Math.PI, Math.PI/4).map(function(angle) {
//     const dx = Math.cos(angle);
//     const dy = Math.sin(angle);
//     return new Point(+dx.toFixed(2), +dy.toFixed(2));
// });

PathNode.directions = [
    new Point(-1, -1),
    new Point(0, -1),
    new Point(+1, -1),

    new Point(-1, 0),
    new Point(+1, 0),

    new Point(-1, +1),
    new Point(0, +1),
    new Point(+1, +1),
];

PathNode.distanceLimit = 900;


function astar(startPoint, goalPoint, step = 15) {
    if (startPoint.distanceTo(goalPoint) >= PathNode.distanceLimit ||
        PathNode.collide(startPoint, step, 0) ||
        PathNode.collide(goalPoint, step, 0)) {
        return [];
    }

    let started = Date.now();

    const start = new PathNode(startPoint);
    const goal = new PathNode(goalPoint);
    start.f = start.g + start.costTo(goal);

    const open = new Map();
    open.set(start.key, start);

    const closed = new Set();

    // PathNode.debug = {};

    while (open.size > 0) {
        // too long or infinite loop;
        if (Date.now() - started > 10) {
            // console.warn("Aborting pathfinding");
            return [];
        }
        let current = new PathNode();
        // TODO: use priority queue
        for (const node of open.values()) {
            if (current.f > node.f)
                current = node;
        }

        if (current.distanceTo(goal) < step) {
            return current.path();
        }

        open.delete(current.key);
        closed.add(current.key);

        current.neighbors(step).forEach(function(point) {
            let neighbor = open.get(point.toString()) || new PathNode(point);
            if (closed.has(point)) {
                return;
            }
            if (point.distanceTo(startPoint) >= PathNode.distanceLimit || PathNode.collide(point, step)) {
                closed.add(point);
                return;
            }
            let g = current.g + current.distanceTo(neighbor);

            const inOpen = open.has(point);
            if (!inOpen || g < neighbor.g) {
                neighbor.parent = current;
                neighbor.g = g;
                neighbor.f = g + neighbor.costTo(goal);
                if (!inOpen) {
                    open.set(neighbor.key, neighbor);

                    // PathNode.debug[neighbor.key] = neighbor;
                }
            }
        });
    }
    return [];
}
