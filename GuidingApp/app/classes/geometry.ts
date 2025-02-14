/**
 * Types representing points and doors in a 2D coordinate system.
 */
export type Dot = { x: number; y: number };
export type Door = [Dot, Dot];

/**
 * Enum to define types of modifications in the matrix.
 */
enum Types {
    CreateMatrix = 0,
    CreateDoor = 1
}

/**
 * Bresenham's algorithm to draw a line between two points on a matrix.
 * Updates the matrix by marking the line positions.
 * @param matrix - The matrix to update.
 * @param p1 - Starting point of the line.
 * @param p2 - Ending point of the line.
 * @param type - Type of marking (CreateMatrix or CreateDoor).
 */
function drawLine(matrix: number[][], p1: Dot, p2: Dot, type: Types): void {
    let { x: x1, y: y1 } = p1;
    let { x: x2, y: y2 } = p2;

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    const height = matrix.length;

    while (true) {
        if (type === Types.CreateMatrix) {
            matrix[height - 1 - y1][x1] = 1;
        } else if (type === Types.CreateDoor) {
            matrix[height - 1 - y1][x1] = 0;
        }

        if (x1 === x2 && y1 === y2) break;

        const e2 = err * 2;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

/**
 * Generates a matrix representation of a closed geometric shape.
 * @param points - List of points representing the shape.
 * @returns A matrix with the shape's lines marked as 1s.
 */
export function generateGeom(points: Dot[]): number[][] {
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));

    if (maxX < 0 || maxY < 0) {
        throw new Error("Invalid shape dimensions.");
    }

    const matrix = Array.from({ length: maxY + 1 }, () => Array(maxX + 1).fill(0));

    for (let i = 0; i < points.length - 1; i++) {
        drawLine(matrix, points[i], points[i + 1], Types.CreateMatrix);
    }

    if (points.length > 1) {
        drawLine(matrix, points[points.length - 1], points[0], Types.CreateMatrix);
    }

    return matrix;
}

/**
 * Updates a matrix by marking door positions with 0.
 * @param matrix - The original matrix.
 * @param doors - List of doors, each defined by a pair of points.
 * @returns A new matrix with door positions marked as 0.
 */
export function updateMatrixWithDoors(matrix: number[][], doors: Door[]): number[][] {
    const newMatrix = matrix.map(row => [...row]); // Create a copy of the matrix

    // Draw each door as a line on the matrix
    doors.forEach(({ 0: start, 1: end }) => {
        drawLine(newMatrix, start, end, Types.CreateDoor);
    });

    return newMatrix;
}

/**
 * Transforms values in a specific region of the matrix.
 * Changes all occurrences of 0 to a specified number, keeping 1 values intact.
 * @param matrix - The input matrix to modify.
 * @param points - List of points defining the region to transform.
 * @param newValue - The number to replace 0s with.
 */
export function transformRegion(matrix: number[][], points: Dot[], newValue: number): void {
    const height = matrix.length;
    const width = matrix[0].length;

    // Define the region bounds
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    // Traverse the region and update values
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            // Ensure the point is within bounds and inside the matrix
            if (x >= 0 && x < width && y >= 0 && y < height && matrix[height - 1 - y][x] === 0) {
                matrix[height - 1 - y][x] = newValue;
            }
        }
    }
}

/**
 * Updates the value of a specific point in the matrix directly.
 * @param matrix - The matrix to update.
 * @param point - The point {x, y}.
 * @param newValue - The new value to set at the specified point.
 */
export function updatePoint(matrix: number[][], point: Dot, newValue: number): void {
    const height = matrix.length;
    const width = matrix[0].length;
    const { x, y } = point;

    if (x < 0 || x >= width || y < 0 || y >= height) {
        throw new Error("Point is out of bounds");
    }

    // Update the matrix directly
    matrix[height - 1 - y][x] = newValue;
}

/**
 * Updates the matrix by setting the specified value for a list of points.
 * @param matrix - The matrix to modify.
 * @param points - The list of points to update.
 * @param newValue - The value to set for each point.
 */
export function updateMatrixWithPoints(matrix: number[][], points: Dot[], newValue: number): void {
    const height = matrix.length;

    points.forEach(({ x, y }) => {
        if (x >= 0 && x < matrix[0].length && y >= 0 && y < height) {
            matrix[height - 1 - y][x] = newValue;
        } else {
            console.warn(`Point (${x}, ${y}) is out of bounds and will be ignored.`);
        }
    });
}

const GeometryUtils = {
    generateGeom,
    updateMatrixWithDoors,
    transformRegion,
    updatePoint,
    updateMatrixWithPoints
};

export default GeometryUtils;
