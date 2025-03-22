package es.gdapp.guidingApp.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import es.gdapp.guidingApp.converters.IntArrayConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(name = "map_data")
public class MapData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Unique identifier

    private String name;

    private double northAngle;

    @Convert(converter = IntArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private int[][] matrix;

    // One-to-many relationship with Node
    @OneToMany(mappedBy = "map", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Node> nodes;

    // Custom constructor to initialize the matrix
    public MapData(String name, double northAngle, int rows, int columns) {
        this.name = name;
        this.northAngle = northAngle;
        this.matrix = new int[rows][columns];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < columns; j++) {
                this.matrix[i][j] = 0;
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
                .append("\" viewBox=\"0 0 ").append(width).append(" ").append(height)
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
     * Before drawing, it checks each coordinate using isPointInMatrix, and if any coordinate is outside
     * the matrix, it throws a RuntimeException.
     * The function also connects the last coordinate with the first to close the shape.
     * It inverts the Y coordinate to match the matrix orientation (0 at the top) before drawing.
     *
     * @param coordinates A list of coordinates where each coordinate is a list with two integers [x, givenY].
     *                    The y value is inverted using the formula: matrix.length - 1 - givenY.
     * @param fillValue   The value (e.g., 0 or 1) to set in the matrix for the cells along the drawn lines.
     * @throws RuntimeException if any coordinate is out of the matrix bounds.
     */
    public void connectCoordinates(List<List<Integer>> coordinates, int fillValue) {
        int rows = matrix.length;

        // Validate each coordinate using isPointInMatrix
        for (List<Integer> coordinate : coordinates) {
            int x = coordinate.get(0);
            int y = rows - 1 - coordinate.get(1);  // Invert Y coordinate
            if (!isPointInMatrix(y, x)) {
                throw new RuntimeException("Coordinate out of bounds: (" + coordinate.get(0) + ", " + coordinate.get(1) + ")");
            }
        }

        // Process each pair of consecutive coordinates (including last-to-first)
        for (int i = 0; i < coordinates.size(); i++) {
            // Get current point and the next point (wrap-around using modulo)
            List<Integer> current = coordinates.get(i);
            List<Integer> next = coordinates.get((i + 1) % coordinates.size());

            // Invert the Y coordinate for both points to get matrix indices
            int x1 = current.get(0);
            int y1 = rows - 1 - current.get(1);
            int x2 = next.get(0);
            int y2 = rows - 1 - next.get(1);

            // Draw vertical segments if x coordinates are equal
            if (x1 == x2) {
                for (int y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    matrix[y][x1] = fillValue;
                }
            } else if (y1 == y2) { // Draw horizontal segments if y coordinates are equal
                for (int x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    matrix[y1][x] = fillValue;
                }
            }
            // (If needed, add handling for non-straight lines.)
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

    /**
     * Resizes the current matrix to new dimensions while preserving the existing values.
     * The content of the original matrix is copied into the new matrix with a vertical offset equal to
     * (newRows - oldRows) and no horizontal offset (col offset = 0). This method assumes that newRows >= oldRows
     * and newCols >= oldCols.
     *
     * For example, if the original matrix is:
     * {0, 0, 0, 0, 0},
     * {0, 0, 0, 0, 0},
     * {0, 1, 1, 1, 0},
     * {0, 1, 0, 1, 0},
     * {0, 1, 1, 1, 0}
     *
     * and new dimensions are 6 rows and 7 columns, the new matrix will be:
     * {0, 0, 0, 0, 0, 0, 0},
     * {0, 0, 0, 0, 0, 0, 0},
     * {0, 0, 0, 0, 0, 0, 0},
     * {0, 1, 1, 1, 0, 0, 0},
     * {0, 1, 0, 1, 0, 0, 0},
     * {0, 1, 1, 1, 0, 0, 0}
     *
     * @param newRows The desired number of rows in the new matrix.
     * @param newCols The desired number of columns in the new matrix.
     */
    public void resizeMatrix(int newRows, int newCols) {
        int oldRows = matrix.length;
        int oldCols = matrix[0].length;
        // Calculate vertical offset: move the original content down by (newRows - oldRows)
        int rowOffset = newRows - oldRows;
        // Horizontal offset remains 0 to keep the original content aligned to the left
        int colOffset = 0;
        // Create a new matrix with the new dimensions; cells are initialized to 0 by default
        int[][] newMatrix = new int[newRows][newCols];

        // Copy the content of the old matrix into the new one at the adjusted positions
        for (int i = 0; i < oldRows; i++) {
            for (int j = 0; j < oldCols; j++) {
                int newRow = i + rowOffset;
                int newCol = j + colOffset;
                // Ensure that the new indices are within bounds (newRow >= 0 is added)
                if (newRow >= 0 && newRow < newRows && newCol < newCols) {
                    newMatrix[newRow][newCol] = matrix[i][j];
                }
            }
        }

        // Update the matrix with the new matrix
        matrix = newMatrix;
    }

}
