package es.gdapp.guidingApp.repositories;

import es.gdapp.guidingApp.models.MapData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MapDataRepository extends JpaRepository<MapData, Long> {
}

