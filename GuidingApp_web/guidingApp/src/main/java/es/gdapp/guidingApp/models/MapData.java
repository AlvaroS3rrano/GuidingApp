package es.gdapp.guidingApp.models;
import lombok.Data;
import lombok.NoArgsConstructor;

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
                this.matrix[i][j] = 0;
            }
        }
    }

    // Utility method to print the matrix
    public void printMatrix() {
        for (int[] row : matrix) {
            for (int value : row) {
                System.out.print(value + " ");
            }
            System.out.println();
        }
    }

    // New method to generate an SVG representation of the matrix
    public String getMatrixSVG() {
        int cellSize = 20; // each cell is 20px square
        int rows = matrix.length;
        int cols = matrix[0].length;
        int width = cols * cellSize;
        int height = rows * cellSize;
        StringBuilder svg = new StringBuilder();
        svg.append("<svg width=\"").append(width)
                .append("\" height=\"").append(height)
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
}
