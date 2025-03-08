package es.gdapp.guidingApp.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Node {
    private Long id;         // Unique identifier for the node
    private String name;     // Name of the node
    private String beaconId; // Beacon identifier
    private Integer x;       // X coordinate
    private Integer y;       // Y coordinate
    private Long mapId;      // Identifier of the map to which this node belongs
    private int[][] area;    // Matrix area similar to MapData's matrix
}
