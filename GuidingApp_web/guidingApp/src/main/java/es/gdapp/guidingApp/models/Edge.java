package es.gdapp.guidingApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "graph_edge")
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer weight;

    private String comment;

    @ManyToOne
    @JoinColumn(name = "from_node_id", nullable = false)
    private Node fromNode;

    @ManyToOne
    @JoinColumn(name = "map_data_id", nullable = false)
    private MapData mapData;


    @ManyToOne
    @JoinColumn(name = "to_node_id", nullable = false)
    private Node toNode;


    public Edge(Node fromNode, Node toNode) {
        this.fromNode = fromNode;
        this.toNode = toNode;
    }

    public Edge(Node source, Node target, int weight, String comment, MapData mapData) {
        this.fromNode = source;
        this.toNode = target;
        this.weight = weight;
        this.comment = comment;
        this.mapData = mapData;
    }


}
