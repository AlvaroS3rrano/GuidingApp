package es.gdapp.guidingApp.mappers;

import es.gdapp.guidingApp.dto.EdgeDTO;
import es.gdapp.guidingApp.dto.MapDataDTO;
import es.gdapp.guidingApp.dto.NodeDTO;
import es.gdapp.guidingApp.models.Edge;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MapDataMapper {
    MapDataDTO toMapDataDTO(MapData map);
    NodeDTO toNodeDTO(Node node);
    EdgeDTO toEdgeDTO(Edge edge);
}
