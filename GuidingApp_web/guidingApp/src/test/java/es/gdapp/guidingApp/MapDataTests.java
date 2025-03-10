package es.gdapp.guidingApp;

import es.gdapp.guidingApp.models.MapData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Arrays;
import java.util.List;

public class MapDataTests {

    private MapData mapData;

    @BeforeEach
    public void setup() {
        // Initialize a 5x5 map for testing
        mapData = new MapData("TestMap", 0.0, 5, 5);
    }

    @Test
    public void testMatrixInitialization() {
        int[][] matrix = mapData.getMatrix();

        // Ensure all elements are initialized to 0
        for (int[] row : matrix) {
            for (int cell : row) {
                assertEquals(0, cell, "Matrix should be initialized with zeros.");
            }
        }
    }

    @Test
    public void testConnectCoordinates() {
        // Define coordinates that should be connected
        List<List<Integer>> coordinates =Arrays.asList(
                Arrays.asList(0, 1),
                Arrays.asList(2, 1),
                Arrays.asList(2, 3),
                Arrays.asList(0, 3)
        );

        // Call the method
        mapData.connectCoordinates(coordinates, 1);

        // Expected matrix after calling connectCoordinates
        int[][] expectedMatrix = {
                {0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0},
                {0, 1, 1, 1, 0},
                {0, 1, 0, 1, 0},
                {0, 1, 1, 1, 0}
        };

        // Validate the result
        assertArrayEquals(expectedMatrix, mapData.getMatrix(), "Matrix should match expected result.");
    }

    @Test
    public void testNoModificationOutsideConnectedCoordinates() {
        // Save original matrix state
        int[][] originalMatrix = mapData.getMatrix();

        // Define coordinates that should be connected
        List<List<Integer>> coordinates = Arrays.asList(
                Arrays.asList(0, 1),
                Arrays.asList(1, 1),
                Arrays.asList(1, 2),
                Arrays.asList(0, 2)
        );

        // Call the method
        mapData.connectCoordinates(coordinates, 1);

        // Ensure only the specified coordinates are modified
        for (int i = 0; i < originalMatrix.length; i++) {
            for (int j = 0; j < originalMatrix[i].length; j++) {
                if ((i == 3 && (j == 1 || j == 2)) || (i == 4 && (j == 1 || j == 2))) {
                    assertEquals(1, mapData.getMatrix()[i][j], "These positions should be 1.");
                } else {
                    assertEquals(0, mapData.getMatrix()[i][j], "These positions should remain 0.");
                }
            }
        }
    }


    @Test
    public void testIsPointInMatrix() {
        // Creamos una instancia de MapData con una matriz de 5x5
        MapData mapData = new MapData("TestMap", 0.0, 5, 5);

        // Puntos válidos (dentro de la matriz)
        assertTrue(mapData.isPointInMatrix(0, 0), "Point (0, 0) should be inside the matrix");
        assertTrue(mapData.isPointInMatrix(4, 4), "Point (4, 4) should be inside the matrix");
        assertTrue(mapData.isPointInMatrix(2, 3), "Point (2, 3) should be inside the matrix");

        // Puntos fuera de los límites
        assertFalse(mapData.isPointInMatrix(5, 0), "Point (5, 0) should be outside the matrix (row index too high)");
        assertFalse(mapData.isPointInMatrix(0, 5), "Point (0, 5) should be outside the matrix (column index too high)");
        assertFalse(mapData.isPointInMatrix(-1, 2), "Point (-1, 2) should be outside the matrix (negative row index)");
        assertFalse(mapData.isPointInMatrix(3, -1), "Point (3, -1) should be outside the matrix (negative column index)");
    }
}

