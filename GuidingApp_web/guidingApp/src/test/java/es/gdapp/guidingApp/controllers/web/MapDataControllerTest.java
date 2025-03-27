package es.gdapp.guidingApp.controllers.web;

import es.gdapp.guidingApp.mappers.MapDataMapperImpl;
import es.gdapp.guidingApp.mappers.MapDataMapper;
import es.gdapp.guidingApp.models.Edge;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.MapDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MapDataController.class)
@Import(MapDataMapperImpl.class) // Importamos la implementación generada por MapStruct
public class MapDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MapDataService mapDataService;

    @Autowired
    private MapDataMapper mapDataMapper;

    @Test
    public void testGetMapDataPageConversion() throws Exception {
        // Creamos un MapData de prueba con un nodo y una arista
        MapData mapData = new MapData("Test Map", 45.0, 3, 3);

        // Creamos y asignamos un nodo
        Node node = new Node();
        node.setId(1L);
        node.setName("Node 1");
        node.setBeaconId("B1");
        node.setX(1);
        node.setY(1);
        node.setArea(new int[][]{{1}});
        node.setMap(mapData);
        List<Node> nodes = new ArrayList<>();
        nodes.add(node);
        mapData.setNodes(nodes);

        // Creamos y asignamos una arista que conecta el nodo consigo mismo
        Edge edge = new Edge(node, node);
        edge.setId(1L);
        edge.setMapData(mapData);
        List<Edge> edges = new ArrayList<>();
        edges.add(edge);
        mapData.setEdges(edges);

        // Simulamos que el servicio retorna una página con el MapData de prueba
        Page<MapData> page = new PageImpl<>(Collections.singletonList(mapData));
        when(mapDataService.getMapDataPage(any(Pageable.class))).thenReturn(page);

        // Realizamos la petición GET al endpoint /mapData/page
        mockMvc.perform(get("/mapData/page")
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                // Verificamos que el DTO convertido tenga el nombre correcto
                .andExpect(jsonPath("$.content[0].name", is("Test Map")))
                // Verificamos que el nodo se ha convertido correctamente
                .andExpect(jsonPath("$.content[0].nodes[0].name", is("Node 1")))
                // Verificamos que la arista convertida tiene id 1
                .andExpect(jsonPath("$.content[0].edges[0].id", is(1)));
    }
}
