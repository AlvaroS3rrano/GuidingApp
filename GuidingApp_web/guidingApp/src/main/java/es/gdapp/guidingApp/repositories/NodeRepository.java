package es.gdapp.guidingApp.repositories;

import es.gdapp.guidingApp.models.Node;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NodeRepository extends JpaRepository<Node, Long> {
}
