package es.gdapp.guidingApp.services.auxiliarClasses;

import es.gdapp.guidingApp.models.Node;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PairScore {
    Node node;
    int score;
}
