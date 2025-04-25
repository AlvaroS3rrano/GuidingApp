package es.gdapp.guidingApp.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Data
@NoArgsConstructor
@Entity
@Table(name = "map_data")
public class MapData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Primary key identifier

    private String name;  // Map name

    private double northAngle;  // Orientation angle relative to north

    @ElementCollection
    @CollectionTable(
            name = "map_data_matrices",
            joinColumns = @JoinColumn(name = "map_data_id"),
            uniqueConstraints = @UniqueConstraint(
                    name = "uc_map_floor",
                    columnNames = { "map_data_id", "floor_number" }
            )
    )
    private List<NamedMatrix> matrices = new ArrayList<>();  // Embedded list of named matrices

    @OneToMany(mappedBy = "map", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Node> nodes;  // One-to-many relationship with Node entities

    @OneToMany(mappedBy = "mapData", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Edge> edges;  // One-to-many relationship with Edge entities

    /**
     * Constructs a MapData instance with an initial named matrix.
     *
     * @param name        the map's name
     * @param northAngle  the orientation angle relative to north
     * @param matrixName  the identifier for the initial matrix block
     * @param rows        the number of rows in the matrix
     * @param columns     the number of columns in the matrix
     */
    public MapData(String name, double northAngle, String matrixName, int rows, int columns) {
        this.name = name;
        this.northAngle = northAngle;

        // Initialize the matrix data (all elements default to 0)
        int[][] data = new int[rows][columns];

        // Create and add the initial NamedMatrix to the collection
        NamedMatrix initial = new NamedMatrix(0, matrixName, data);
        this.matrices.add(initial);
    }

    /**
     * Finds the first NamedMatrix with the specified number.
     *
     * @param number the matrix number to search for
     * @return an Optional containing the NamedMatrix if found, or empty if not
     */
    public Optional<NamedMatrix> findMatrixByFloor(int number) {
        return matrices.stream()
                .filter(m -> m.getFloorNumber() != null && m.getFloorNumber() == number)
                .findFirst();
    }

    /**
     * Retrieves the NamedMatrix with the specified number or throws an exception if not found.
     *
     * @param number the matrix number to retrieve
     * @return the matching NamedMatrix
     * @throws NoSuchElementException if no matrix with that number exists
     */
    public NamedMatrix getMatrixByFloor(int number) {
        return findMatrixByFloor(number)
                .orElseThrow(() ->
                        new NoSuchElementException("No matrix found with number " + number));
    }

    /**
     * Prints the matrix for the specified floor number to standard output.
     *
     * @param floorNumber the matrix number to print
     */
    public void printMatrix(int floorNumber) {
        NamedMatrix namedMatrix = getMatrixByFloor(floorNumber);
        int[][] matrix = namedMatrix.getMatrix();
        for (int[] row : matrix) {
            for (int value : row) {
                System.out.print(value + " ");
            }
            System.out.println();
        }
    }

    /**
     * Generates an SVG representation of the specified matrix.
     * Each cell is rendered as a 20x20 pixel square; cells with value 1 are black, others are white.
     *
     * @param floorNumber the matrix number to render
     * @return a String containing the SVG markup for the matrix
     */
    public String getMatrixSVG(int floorNumber) {
        NamedMatrix namedMatrix = getMatrixByFloor(floorNumber);
        int[][] matrix = namedMatrix.getMatrix();
        int cellSize = 20;  // size in pixels for each square cell
        int rows = matrix.length;
        int cols = matrix[0].length;
        int width = cols * cellSize;
        int height = rows * cellSize;

        StringBuilder svg = new StringBuilder();
        svg.append("<svg width=\"").append(width)
                .append("\" height=\"").append(height)
                .append("\" viewBox=\"0 0 ").append(width).append(" ").append(height)
                .append("\" xmlns=\"http://www.w3.org/2000/svg\">");

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                String fill = matrix[i][j] == 1 ? "black" : "white";
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
     * Draws lines between a series of coordinates on the specified matrix, filling values along the path.
     * Horizontal and vertical segments are supported; the method closes the shape by connecting last to first.
     *
     * @param coordinates a list of [x, y] coordinate pairs (y inverted internally)
     * @param fillValue   the value to set for each cell along the path (e.g., 0 or 1)
     * @param floorNumber the matrix number on which to draw
     * @throws RuntimeException if any coordinate lies outside matrix bounds
     */
    public void connectCoordinates(List<List<Integer>> coordinates, int fillValue, int floorNumber) {
        NamedMatrix namedMatrix = getMatrixByFloor(floorNumber);
        int[][] matrix = namedMatrix.getMatrix();
        int rows = matrix.length;

        // Validate all coordinates
        for (List<Integer> c : coordinates) {
            int x = c.get(0);
            int y = rows - 1 - c.get(1);  // invert Y
            if (!isPointInMatrix(y, x, matrix)) {
                throw new RuntimeException("Coordinate out of bounds: (" + c.get(0) + ", " + c.get(1) + ")");
            }
        }

        // Draw each segment
        for (int i = 0; i < coordinates.size(); i++) {
            List<Integer> curr = coordinates.get(i);
            List<Integer> next = coordinates.get((i + 1) % coordinates.size());
            int x1 = curr.get(0);
            int y1 = rows - 1 - curr.get(1);
            int x2 = next.get(0);
            int y2 = rows - 1 - next.get(1);

            if (x1 == x2) {
                for (int y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    matrix[y][x1] = fillValue;
                }
            } else if (y1 == y2) {
                for (int x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    matrix[y1][x] = fillValue;
                }
            }
        }
    }

    /**
     * Checks if a point is within the bounds of a given matrix.
     *
     * @param row    the row index to validate
     * @param col    the column index to validate
     * @param matrix the 2D array to check against
     * @return true if the row/col are within bounds, false otherwise
     */
    public boolean isPointInMatrix(int row, int col, int[][] matrix) {
        return row >= 0 && row < matrix.length
                && col >= 0 && col < matrix[0].length;
    }

    /**
     * Resizes the specified matrix, preserving existing values and adding a vertical offset.
     * Original contents are shifted down by (newRows - oldRows), with no horizontal shift.
     *
     * @param newRows     the new row count (>= original)
     * @param newCols     the new column count (>= original)
     * @param floorNumber the matrix number to resize
     */
    public void resizeMatrix(int newRows, int newCols, int floorNumber) {
        NamedMatrix namedMatrix = getMatrixByFloor(floorNumber);
        int[][] oldMatrix = namedMatrix.getMatrix();
        int oldRows = oldMatrix.length;
        int oldCols = oldMatrix[0].length;
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
                    newMatrix[newRow][newCol] = oldMatrix[i][j];
                }
            }
        }

        namedMatrix.setMatrix(newMatrix);
    }
}
