package es.gdapp.guidingApp.repositories;

import es.gdapp.guidingApp.models.Node;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NodeRepository extends JpaRepository<Node, Long> {

    Optional<Node> findByBeaconId(String beaconId);

}
