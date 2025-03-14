package es.gdapp.guidingApp.dataBaseTests;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.services.MapDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class MapDataServiceTest {

    @Autowired
    private MapDataService mapDataService;

    @Test
    public void testCreateRetrieveUpdateDeleteMapData() {
        // Create a new MapData with a 3x3 matrix
        MapData mapData = new MapData("Test Map", 45.0, 3, 3);
        MapData saved = mapDataService.saveMapData(mapData);
        assertNotNull(saved.getId(), "MapData ID should be set after saving");

        // Retrieve by id
        MapData retrieved = mapDataService.getMapDataById(saved.getId())
                .orElseThrow(() -> new AssertionError("MapData not found"));
        assertEquals("Test Map", retrieved.getName(), "MapData name should match");

        // Update: change name and update
        retrieved.setName("Updated Map");
        MapData updated = mapDataService.updateMapData(retrieved.getId(), retrieved);
        assertEquals("Updated Map", updated.getName(), "MapData name should be updated");

        // Delete and confirm deletion
        mapDataService.deleteMapData(updated.getId());
        assertFalse(mapDataService.getMapDataById(updated.getId()).isPresent(), "MapData should be deleted");
    }
}
