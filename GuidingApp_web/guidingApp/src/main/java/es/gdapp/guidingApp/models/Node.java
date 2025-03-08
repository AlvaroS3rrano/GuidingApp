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
    private Point point;     // Coordinate (x, y)
    private Long mapId;      // Identifier of the map to which this node belongs
}

