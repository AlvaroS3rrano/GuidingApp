package es.gdapp.guidingApp.dto;

import lombok.Data;
import java.util.List;

@Data
public class MapDataDTO {
    private Long id;

    private String name;

    private double northAngle;

    private double latitude;

    private double longitude;

    private List<NamedMatrixDTO> matrices;

    private List<NodeDTO> nodes;

    private List<EdgeDTO> edges;
}