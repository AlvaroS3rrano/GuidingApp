package es.gdapp.guidingApp;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.NamedMatrix;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class MapDataTests {

    private MapData mapData;

    @BeforeEach
    public void setup() {
        // Initialize a 5x5 map for testing,
        // using "initial" as the matrixName and floorNumber = 0
        mapData = new MapData("TestMap", 0.0, 40.335722, -3.876528, "initial", 5, 5);
    }

    @Test
    public void testMatrixInitialization() {
        int[][] matrix = mapData.getMatrixByFloor(0).getMatrix();

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
        List<List<Integer>> coordinates = Arrays.asList(
                Arrays.asList(1, 0),
                Arrays.asList(3, 0),
                Arrays.asList(3, 2),
                Arrays.asList(1, 2)
        );

        // Call the method on floor 0
        mapData.connectCoordinates(coordinates, 1, 0);

        // Expected matrix after calling connectCoordinates
        int[][] expectedMatrix = {
                {0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0},
                {0, 1, 1, 1, 0},
                {0, 1, 0, 1, 0},
                {0, 1, 1, 1, 0}
        };

        int[][] result = mapData.getMatrixByFloor(0).getMatrix();
        assertArrayEquals(expectedMatrix, result, "Matrix should match expected result.");
    }

    @Test
    public void testNoModificationOutsideConnectedCoordinates() {
        // Save original matrix state
        int[][] original = mapData.getMatrixByFloor(0).getMatrix();

        // Define a different rectangle
        List<List<Integer>> coords = Arrays.asList(
                Arrays.asList(0, 1),
                Arrays.asList(1, 1),
                Arrays.asList(1, 2),
                Arrays.asList(0, 2)
        );

        mapData.connectCoordinates(coords, 1, 0);

        int[][] result = mapData.getMatrixByFloor(0).getMatrix();
        for (int i = 0; i < result.length; i++) {
            for (int j = 0; j < result[i].length; j++) {
                boolean shouldBeOne =
                        (i >= 2 && i <= 3) && (j >= 0 && j <= 1);
                if (shouldBeOne) {
                    assertEquals(1, result[i][j],
                            "Position ("+i+","+j+") should be 1.");
                } else {
                    assertEquals(0, result[i][j],
                            "Position ("+i+","+j+") should remain 0.");
                }
            }
        }
    }

    @Test
    public void testIsPointInMatrix() {
        // You can add a helper in MapData:
        Optional<NamedMatrix> matrix = mapData.findMatrixByFloor(0);
        if (matrix.isPresent()) {
            // public boolean isPointInMatrix(int row, int col, int floorNumber) { … }
            assertTrue(mapData.isPointInMatrix(0, 0, matrix.get().getMatrix()),
                    "Point (0,0) should be inside the matrix");
            assertTrue(mapData.isPointInMatrix(4, 4, matrix.get().getMatrix()),
                    "Point (4,4) should be inside the matrix");
            assertFalse(mapData.isPointInMatrix(5, 0, matrix.get().getMatrix()),
                    "Point (5,0) should be outside the matrix");
            assertFalse(mapData.isPointInMatrix(0, 5, matrix.get().getMatrix()),
                    "Point (0,5) should be outside the matrix");
            assertFalse(mapData.isPointInMatrix(-1, 2, matrix.get().getMatrix()),
                    "Point (-1,2) should be outside the matrix");
            assertFalse(mapData.isPointInMatrix(3, -1, matrix.get().getMatrix()),
                    "Point (3,-1) should be outside the matrix");
        }

    }

    @Test
    public void testResizeMatrixIncrease() {

        int[][] pattern = {
                {0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0},
                {0, 1, 1, 1, 0},
                {0, 1, 0, 1, 0},
                {0, 1, 1, 1, 0}
        };

        mapData.getMatrices().add(new NamedMatrix(1, "test", pattern));
        // Increase from 5x5 to 6x7
        mapData.resizeMatrix(6, 7, 1);

        int[][] expected = {
                {0, 0, 0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0, 0, 0},
                {0, 1, 1, 1, 0, 0, 0},
                {0, 1, 0, 1, 0, 0, 0},
                {0, 1, 1, 1, 0, 0, 0}
        };
        assertArrayEquals(expected,
                mapData.getMatrixByFloor(1).getMatrix(),
                "Matrix should be resized correctly when increasing size.");
    }

    @Test
    public void testResizeMatrixDecrease() {
        int[][] pattern = {
                {0, 0, 0, 0, 0},
                {0, 0, 0, 0, 0},
                {0, 1, 1, 1, 0},
                {0, 1, 0, 1, 0},
                {0, 1, 1, 1, 0}
        };

        mapData.getMatrices().add(new NamedMatrix(1, "test", pattern));
        // Decrease from 5x5 to 4x4
        mapData.resizeMatrix(4, 4, 1);

        int[][] expected = {
                {0, 0, 0, 0},
                {0, 1, 1, 1},
                {0, 1, 0, 1},
                {0, 1, 1, 1}
        };
        assertArrayEquals(expected,
                mapData.getMatrixByFloor(1).getMatrix(),
                "Matrix should be resized correctly when decreasing size.");
    }
}
