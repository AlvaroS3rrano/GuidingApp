package es.gdapp.guidingApp.dto;

import lombok.Data;
import java.util.List;

@Data
public class MapDataDTO {
    private Long id;
    private String name;
    private double northAngle;
    private int[][] matrix;
    private List<NodeDTO> nodes;
    private List<EdgeDTO> edges;
}