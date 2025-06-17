package es.gdapp.guidingApp.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.gdapp.guidingApp.converters.IntArrayConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

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

    private Integer floorNumber;

    private boolean isExit;

    private boolean isEntrance;

    private Integer x;

    private Integer y;

    // Many-to-one relationship with MapData
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_data_id")
    @JsonBackReference
    private MapData mapData;

    @Convert(converter = IntArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private int[][] area;

    public Node(String name, String beaconId, Integer floorNumber, boolean isExit, boolean isEntrance,
                Integer x, Integer y, int[][] area, MapData mapData) {
        this.name = name;
        this.beaconId = beaconId;
        this.floorNumber = floorNumber;
        this.isExit = isExit;
        this.isEntrance = isEntrance;
        this.x = x;
        this.y = y;
        this.area = area;
        this.mapData = mapData;
    }

    @Transient
    public String getNodeJson() {
        try {
            // Create a simple map with the fields you want to expose.
            Map<String, Object> nodeData = new HashMap<>();
            nodeData.put("id", this.id);
            nodeData.put("name", this.name);
            nodeData.put("beaconId", this.beaconId);
            nodeData.put("floorNumber", this.floorNumber);
            nodeData.put("isExit", this.isExit);
            nodeData.put("isEntrance", this.isEntrance);
            nodeData.put("x", this.x);
            nodeData.put("y", this.y);
            nodeData.put("area", this.area);
            // You can omit the 'map' property to avoid lazy loading issues.
            return new ObjectMapper().writeValueAsString(nodeData);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
