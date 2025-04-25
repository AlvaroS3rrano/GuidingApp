package es.gdapp.guidingApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NamedMatrixDTO {
    /** Identifier for this matrix block (e.g. floor number) */
    private Integer floorNumber;

    /** Human-readable name of the matrix block */
    private String name;

    /** The 2D matrix data */
    private int[][] matrix;
}
