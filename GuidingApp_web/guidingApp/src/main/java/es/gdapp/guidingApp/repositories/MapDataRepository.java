package es.gdapp.guidingApp.repositories;

import es.gdapp.guidingApp.models.MapData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MapDataRepository extends JpaRepository<MapData, Long> {

    List<MapData> findByNameIgnoreCaseContaining(String name);
}

