// NamedMatrix.java
package es.gdapp.guidingApp.models;

import es.gdapp.guidingApp.converters.IntArrayConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class NamedMatrix {
    @Column(name = "floor_number", nullable = false)
    private Integer floorNumber;
    private String name;

    @Convert(converter = IntArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private int[][] matrix;

    public NamedMatrix(int floorNumber, String name,  int rows, int columns){
        this.floorNumber = floorNumber;
        this.name = name;
        this.matrix = new int[rows][columns];
    }
}
