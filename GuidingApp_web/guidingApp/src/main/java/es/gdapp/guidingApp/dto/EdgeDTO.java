package es.gdapp.guidingApp.dto;

import lombok.Data;

@Data
public class EdgeDTO {
    private Long id;
    private NodeDTO fromNode;
    private NodeDTO toNode;
}
