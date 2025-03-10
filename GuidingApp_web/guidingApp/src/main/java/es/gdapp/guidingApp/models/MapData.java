package es.gdapp.guidingApp.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class MapData {
    private Long id;         // Unique identifier for the map
    private String name;
    private double northAngle;
    private int[][] matrix;

    // Constructor to initialize the map with a specific number of rows and columns
    public MapData(String name, double northAngle, int rows, int columns) {
        this.name = name;
        this.northAngle = northAngle;
        this.matrix = new int[rows][columns];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < columns; j++) {
                this.matrix[i][j] = 0; // Initialize matrix with 0s
            }
        }
    }

    // Utility method to print the matrix
    public void printMatrix() {
        for (int[] row : matrix) {
            for (int value : row) {
                System.out.print(value + " "); // Print each value in the matrix
            }
            System.out.println();
        }
    }

    /**
     * Generates an SVG representation of the matrix.
     * Each cell is represented as a 20x20 pixel square.
     * Cells with a value of 1 are filled with black, and cells with a value of 0 are filled with white.
     *
     * @return A String containing the SVG markup representing the matrix.
     */
    public String getMatrixSVG() {
        int cellSize = 20; // Each cell is 20px square
        int rows = matrix.length;
        int cols = matrix[0].length;
        int width = cols * cellSize;
        int height = rows * cellSize;
        StringBuilder svg = new StringBuilder();
        svg.append("<svg width=\"").append(width)
                .append("\" height=\"").append(height)
                .append("\" xmlns=\"http://www.w3.org/2000/svg\">");
        // Loop through matrix to create SVG rectangles for each cell
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                String fill = matrix[i][j] == 1 ? "black" : "white"; // Mark cells with 1 as black
                svg.append("<rect x=\"").append(j * cellSize)
                        .append("\" y=\"").append(i * cellSize)
                        .append("\" width=\"").append(cellSize)
                        .append("\" height=\"").append(cellSize)
                        .append("\" fill=\"").append(fill)
                        .append("\" stroke=\"gray\"/>");
            }
        }
        svg.append("</svg>");
        return svg.toString();
    }

    /**
     * Connects a list of coordinates by drawing horizontal or vertical lines between consecutive points.
     * The function also connects the last coordinate with the first to close the shape.
     * It inverts the Y coordinate to match the matrix orientation (0 at the top) before drawing.
     *
     * @param coordinates A list of coordinates where each coordinate is a list with two integers [givenY, x].
     *                    The first element (givenY) is inverted using the formula: matrix.length - 1 - givenY.
     * @param fillValue The value (e.g., 0 or 1) to set in the matrix for the cells along the drawn lines.
     */
    public void connectCoordinates(List<List<Integer>> coordinates, int fillValue) {
        int rows = matrix.length;
        // Loop through all coordinates, including the segment from the last back to the first
        for (int i = 0; i < coordinates.size(); i++) {
            // Get current point and the next point (using modulo to wrap around)
            List<Integer> current = coordinates.get(i);
            List<Integer> next = coordinates.get((i + 1) % coordinates.size());

            // Invert the Y coordinate for both points
            int x1 = current.get(1);
            int y1 = rows - 1 - current.get(0);
            int x2 = next.get(1);
            int y2 = rows - 1 - next.get(0);

            // Draw horizontal or vertical lines only
            if (x1 == x2) { // Vertical segment
                for (int y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    matrix[y][x1] = fillValue;
                }
            } else if (y1 == y2) { // Horizontal segment
                for (int x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    matrix[y1][x] = fillValue;
                }
            }
            // If needed, add handling for non-straight lines.
        }
    }

    /**
     * Checks if the given point (row, col) exists within the matrix.
     *
     * @param row The row index (after any transformation, if applicable)
     * @param col The column index
     * @return true if the point is inside the matrix bounds, false otherwise.
     */
    public boolean isPointInMatrix(int row, int col) {
        return row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length;
    }

}
