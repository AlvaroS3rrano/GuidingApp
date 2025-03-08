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
        // Create a matrix with the specified dimensions and initialize it with zeros
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
}
