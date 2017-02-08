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
        return PathNode
            .directions(step)
            .map(dir => this.point.clone().add(dir));
    }

    costTo(node) {
        return this.manhattenDistanceTo(node);
    }

    distanceTo(node) {
        return this.point.distanceTo(node.point);
    }

    manhattenDistanceTo(node) {
        return Math.abs(this.point.x - node.point.x) + Math.abs(this.point.y - node.point.y);
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

    static directions(step) {
        // const step = Math.PI/4;
        // let directions = [];
        // for (let angle = 0; angle < 2*Math.PI; angle += step) {
        //     var dx = Math.cos(angle);
        //     var dy = Math.sin(angle);
        //     directions.push(new Point(dx * step, dy * step));
        // }
        // return directions;
        return [
            new Point(-step, -step),
            new Point(0, -step),
            new Point(+step, -step),

            new Point(-step, 0),
            new Point(+step, 0),

            new Point(-step, +step),
            new Point(0, +step),
            new Point(+step, +step),
        ];
    }

    static collide(point, step) {
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

        return game.player.willCollide(point, 3);
    }
}

PathNode.distanceLimit = 600;

function astar(startPoint, goalPoint, step) {
    if (startPoint.distanceTo(goalPoint) >= PathNode.distanceLimit || PathNode.collide(goalPoint, step)) {
        return [];
    }

    let steps = 0;

    const start = new PathNode(startPoint);
    const goal = new PathNode(goalPoint);
    start.f = start.g + start.costTo(goal);

    const open = new Map();
    open.set(start.key, start);

    const closed = new Set();

    while (open.size > 0) {
        steps++;
        // too long or infinite loop;
        if (steps > 1000) {
            console.warn("Aborting pathfinding");
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
                }
            }
        });
    }
    return [];
}
