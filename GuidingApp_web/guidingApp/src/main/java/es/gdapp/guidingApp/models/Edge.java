package es.gdapp.guidingApp.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "graph_edge")
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "from_node_id", nullable = false)
    private Node fromNode;

    @ManyToOne
    @JoinColumn(name = "map_id", nullable = false)
    private MapData mapData;


    @ManyToOne
    @JoinColumn(name = "to_node_id", nullable = false)
    private Node toNode;

    // Constructor, getters y setters

    public Edge() {
    }

    public Edge(Node fromNode, Node toNode) {
        this.fromNode = fromNode;
        this.toNode = toNode;
    }


}
