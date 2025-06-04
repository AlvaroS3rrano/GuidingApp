package es.gdapp.guidingApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NodeMapDataSearchResultDTO {
    private NodeDTO node;
    private MapDataDTO mapData;
    private int score;
}