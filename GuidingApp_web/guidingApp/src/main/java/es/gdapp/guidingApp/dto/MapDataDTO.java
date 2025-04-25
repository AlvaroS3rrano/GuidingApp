package es.gdapp.guidingApp.dto;

import lombok.Data;
import java.util.List;

@Data
public class MapDataDTO {
    /** MapData entity primary key */
    private Long id;

    /** Map name */
    private String name;

    /** Orientation angle relative to north */
    private double northAngle;

    /** List of named matrix blocks */
    private List<NamedMatrixDTO> matrices;

    /** Serialized node DTOs */
    private List<NodeDTO> nodes;

    /** Serialized edge DTOs */
    private List<EdgeDTO> edges;
}