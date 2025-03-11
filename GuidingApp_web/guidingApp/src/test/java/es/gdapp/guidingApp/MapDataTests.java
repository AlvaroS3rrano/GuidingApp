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
                Arrays.asList(1, 0),
                Arrays.asList(3, 0),
                Arrays.asList(3, 2),
                Arrays.asList(1, 2)
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
                if ((i == 2 && (j == 0 || j == 1)) || (i == 3 && (j == 0 || j == 1))) {
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

    @Test
    public void testResizeMatrixIncrease() {
        // Set a known pattern in the 5x5 matrix:
        // Row 0: [0, 0, 0, 0, 0]
        // Row 1: [0, 0, 0, 0, 0]
        // Row 2: [0, 1, 1, 1, 0]
        // Row 3: [0, 1, 0, 1, 0]
        // Row 4: [0, 1, 1, 1, 0]
        int[][] pattern = {
                {0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0},
                {0, 1, 1, 1, 0},
                {0, 1, 0, 1, 0},
                {0, 1, 1, 1, 0}
        };
        mapData.setMatrix(pattern);

        // Increase the matrix size from 5x5 to 6x7.
        // Expected vertical offset: newRows - oldRows = 6 - 5 = 1.
        mapData.resizeMatrix(6, 7);

        int[][] expectedMatrix = {
                {0, 0, 0, 0, 0, 0, 0},   // new row 0: new, not filled from original content
                {0, 0, 0, 0, 0, 0, 0},   // new row 1: copy of original row 0
                {0, 0, 0, 0, 0, 0, 0},   // new row 2: copy of original row 1
                {0, 1, 1, 1, 0, 0, 0},   // new row 3: copy of original row 2
                {0, 1, 0, 1, 0, 0, 0},   // new row 4: copy of original row 3
                {0, 1, 1, 1, 0, 0, 0}    // new row 5: copy of original row 4
        };

        assertArrayEquals(expectedMatrix, mapData.getMatrix(), "Matrix should be resized correctly when increasing size.");
    }

    @Test
    public void testResizeMatrixDecrease() {
        // Set a known pattern in the 5x5 matrix:
        // Row 0: [0, 0, 0, 0, 0]
        // Row 1: [0, 0, 0, 0, 0]
        // Row 2: [0, 1, 1, 1, 0]
        // Row 3: [0, 1, 0, 1, 0]
        // Row 4: [0, 1, 1, 1, 0]
        int[][] pattern = {
                {0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0},
                {0, 1, 1, 1, 0},
                {0, 1, 0, 1, 0},
                {0, 1, 1, 1, 0}
        };
        mapData.setMatrix(pattern);

        // Decrease the matrix size from 5x5 to 4x4.
        // Expected vertical offset: newRows - oldRows = 4 - 5 = -1, so the top row is dropped.
        mapData.resizeMatrix(4, 4);

        int[][] expectedMatrix = {
                {0, 0, 0, 0},    // new row 0: copy of original row 1
                {0, 1, 1, 1},    // new row 1: copy of original row 2
                {0, 1, 0, 1},    // new row 2: copy of original row 3
                {0, 1, 1, 1}     // new row 3: copy of original row 4
        };

        assertArrayEquals(expectedMatrix, mapData.getMatrix(), "Matrix should be resized correctly when decreasing size.");
    }
}


