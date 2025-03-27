package es.gdapp.guidingApp.dataBaseTests;

import es.gdapp.guidingApp.models.Edge;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.MapDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class MapDataServiceTest {

    @Autowired
    private MapDataService mapDataService;

    @Test
    public void testCreateRetrieveUpdateDeleteMapData() {
        // Test original (ya existente)
        MapData mapData = new MapData("Test Map", 45.0, 3, 3);
        MapData saved = mapDataService.saveMapData(mapData);
        assertNotNull(saved.getId(), "MapData ID should be set after saving");

        MapData retrieved = mapDataService.getMapDataById(saved.getId())
                .orElseThrow(() -> new AssertionError("MapData not found"));
        assertEquals("Test Map", retrieved.getName(), "MapData name should match");

        retrieved.setName("Updated Map");
        MapData updated = mapDataService.updateMapData(retrieved.getId(), retrieved);
        assertEquals("Updated Map", updated.getName(), "MapData name should be updated");

        mapDataService.deleteMapData(updated.getId());
        assertFalse(mapDataService.getMapDataById(updated.getId()).isPresent(), "MapData should be deleted");
    }

    @Test
    public void testMapDataAllAttributesArePersisted() {
        // Matriz personalizada
        int[][] customMatrix = {
                {1, 0, 1},
                {0, 1, 0},
                {1, 0, 1}
        };

        // Crear MapData con atributos completos
        MapData mapData = new MapData("Full Test Map", 90.0, 3, 3);
        mapData.setMatrix(customMatrix);

        // Crear nodos y asignarles el mapData
        Node node1 = new Node();
        node1.setName("Node1");
        node1.setBeaconId("B1");
        node1.setX(1);
        node1.setY(1);
        node1.setArea(new int[][]{{1}});
        node1.setMap(mapData);

        Node node2 = new Node();
        node2.setName("Node2");
        node2.setBeaconId("B2");
        node2.setX(2);
        node2.setY(2);
        node2.setArea(new int[][]{{2}});
        node2.setMap(mapData);

        List<Node> nodes = new ArrayList<>();
        nodes.add(node1);
        nodes.add(node2);
        mapData.setNodes(nodes);

        Edge edge = new Edge(node1, node2);
        edge.setMapData(mapData);

        List<Edge> edges = new ArrayList<>();
        edges.add(edge);
        mapData.setEdges(edges);

        // Guardar MapData con todos sus atributos
        MapData saved = mapDataService.saveMapData(mapData);

        // Recuperar y verificar cada atributo
        MapData retrieved = mapDataService.getMapDataById(saved.getId())
                .orElseThrow(() -> new AssertionError("MapData not found"));

        // Verificar atributos básicos
        assertEquals("Full Test Map", retrieved.getName(), "El nombre debe coincidir");
        assertEquals(90.0, retrieved.getNorthAngle(), "El northAngle debe coincidir");

        // Verificar la matriz
        assertNotNull(retrieved.getMatrix(), "La matriz no debe ser nula");
        assertEquals(customMatrix.length, retrieved.getMatrix().length, "El número de filas debe coincidir");
        for (int i = 0; i < customMatrix.length; i++) {
            assertArrayEquals(customMatrix[i], retrieved.getMatrix()[i], "La fila " + i + " debe coincidir");
        }

        // Verificar nodos
        assertNotNull(retrieved.getNodes(), "La lista de nodos no debe ser nula");
        assertEquals(2, retrieved.getNodes().size(), "Debe haber 2 nodos");
        // Verificar atributos de cada nodo (por ejemplo, el primero)
        Node rnode1 = retrieved.getNodes().get(0);
        assertEquals("Node1", rnode1.getName(), "El nombre del primer nodo debe coincidir");
        assertEquals("B1", rnode1.getBeaconId(), "El beaconId del primer nodo debe coincidir");
        assertEquals(1, rnode1.getX(), "La posición X del primer nodo debe coincidir");
        assertEquals(1, rnode1.getY(), "La posición Y del primer nodo debe coincidir");

        // Verificar aristas (si la relación se ha configurado correctamente)
        assertNotNull(retrieved.getEdges(), "La lista de aristas no debe ser nula");
        assertEquals(1, retrieved.getEdges().size(), "Debe haber 1 arista");
        Edge redge = retrieved.getEdges().get(0);
        assertEquals("Node1", redge.getFromNode().getName(), "El nodo origen de la arista debe ser 'Node1'");
        assertEquals("Node2", redge.getToNode().getName(), "El nodo destino de la arista debe ser 'Node2'");
    }
}
