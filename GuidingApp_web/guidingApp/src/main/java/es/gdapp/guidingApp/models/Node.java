package es.gdapp.guidingApp.models;

import es.gdapp.guidingApp.converters.IntArrayConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "node")
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Unique identifier

    private String name;

    private String beaconId;

    private Integer x;

    private Integer y;

    // Many-to-one relationship with MapData
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id")
    private MapData map;

    @Convert(converter = IntArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private int[][] area;
}
