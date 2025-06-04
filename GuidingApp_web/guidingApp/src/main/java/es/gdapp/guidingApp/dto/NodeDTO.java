package es.gdapp.guidingApp.dto;

import lombok.Data;

@Data
public class NodeDTO {
    private Long id;
    private String name;
    private String beaconId;
    private Integer floorNumber;
    private boolean isExit;
    private boolean isEntrance;
    private Integer x;
    private Integer y;
    private int[][] area;
}
