package es.gdapp.guidingApp.models;

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

    private Integer x;

    private Integer y;

    // Many-to-one relationship with MapData
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_id")
    private MapData map;

    @Convert(converter = IntArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private int[][] area;

    @Transient
    public String getNodeJson() {
        try {
            // Create a simple map with the fields you want to expose.
            Map<String, Object> nodeData = new HashMap<>();
            nodeData.put("id", this.id);
            nodeData.put("name", this.name);
            nodeData.put("beaconId", this.beaconId);
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
