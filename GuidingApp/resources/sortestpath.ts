import { Dot } from '../app/classes/geometry';

type Node = {
    point: Dot;
    cost: number;
    heuristic: number;
    parent?: Node;
};

/**
 * Calculates the shortest path between two points in a matrix while keeping a distance of 1 from walls (value 1).
 * Excludes the start and end points from the resulting path.
 * @param matrix - The input matrix.
 * @param start - The starting point as { x, y }.
 * @param end - The destination point as { x, y }.
 * @returns An array of points representing the path (excluding start and end) or an empty array if no path exists.
 */
export function findPathWithDistance(matrix: number[][], start: Dot, end: Dot): Dot[] {
    const height = matrix.length;
    const width = matrix[0].length;

    const isValid = (x: number, y: number) =>
        x >= 0 && x < width && y >= 0 && y < height && matrix[height - 1 - y][x] !== 1;

    const getNeighbors = ({ x, y }: Dot): Dot[] => {
        const neighbors: Dot[] = [
            { x, y: y - 1 }, // Up
            { x, y: y + 1 }, // Down
            { x: x - 1, y }, // Left
            { x: x + 1, y }, // Right
        ];
        return neighbors.filter(({ x, y }) => isValid(x, y));
    };

    const calculateDistance = (a: Dot, b: Dot) =>
        Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    const calculateProximityToWalls = ({ x, y }: Dot) => {
        const offsets = [
            { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
            { x: 0, y: -1 },                   { x: 0, y: 1 },
            { x: 1, y: -1 }, { x: 1, y: 0 },  { x: 1, y: 1 },
        ];
        return offsets.reduce((count, { x: dx, y: dy }) => {
            const nx = x + dx;
            const ny = y + dy;
            return count + (isValid(nx, ny) && matrix[height - 1 - ny][nx] === 1 ? 1 : 0);
        }, 0);
    };

    const startNode: Node = {
        point: start,
        cost: 0,
        heuristic: calculateDistance(start, end),
    };

    const openSet: Node[] = [startNode];
    const closedSet = new Set<string>();

    const nodeKey = ({ x, y }: Dot) => `${x},${y}`;

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.cost + a.heuristic - (b.cost + b.heuristic));
        const currentNode = openSet.shift()!;

        if (currentNode.point.x === end.x && currentNode.point.y === end.y) {
            const path: Dot[] = [];
            let node: Node | undefined = currentNode;
            while (node) {
                path.unshift(node.point);
                node = node.parent;
            }
            return path.length > 2 ? path.slice(1, -1) : [];
        }

        closedSet.add(nodeKey(currentNode.point));

        for (const neighbor of getNeighbors(currentNode.point)) {
            const key = nodeKey(neighbor);
            if (closedSet.has(key)) continue;

            const proximityPenalty = calculateProximityToWalls(neighbor);
            const cost = currentNode.cost + 1 + proximityPenalty;

            const existingNode = openSet.find(n => n.point.x === neighbor.x && n.point.y === neighbor.y);
            if (existingNode) {
                if (cost < existingNode.cost) {
                    existingNode.cost = cost;
                    existingNode.parent = currentNode;
                }
            } else {
                openSet.push({
                    point: neighbor,
                    cost,
                    heuristic: calculateDistance(neighbor, end),
                    parent: currentNode,
                });
            }
        }
    }
    return [];
}
