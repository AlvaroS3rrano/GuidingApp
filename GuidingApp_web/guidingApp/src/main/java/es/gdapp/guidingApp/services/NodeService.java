package es.gdapp.guidingApp.services;

import es.gdapp.guidingApp.dto.MapDataDTO;
import es.gdapp.guidingApp.dto.NodeDTO;
import es.gdapp.guidingApp.dto.NodeMapDataSearchResultDTO;
import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.repositories.NodeRepository;
import es.gdapp.guidingApp.services.auxiliarClasses.PairScore;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import es.gdapp.guidingApp.mappers.DataMapper;


import java.util.*;
import java.util.stream.Collectors;

@Service
public class NodeService {

    private final NodeRepository nodeRepository;
    private final DataMapper dataMapper;

    @Autowired
    public NodeService(NodeRepository nodeRepository, DataMapper dataMapper) {
        this.nodeRepository = nodeRepository;
        this.dataMapper = dataMapper;
    }

    // Create or update a Node entry
    public Node saveNode(Node node) {
        return nodeRepository.save(node);
    }

    // Retrieve a Node by its id
    public Optional<Node> getNodeById(Long id) {
        return nodeRepository.findById(id);
    }

    // Retrieve all Node entries
    public Collection<Node> getAllNodes() {
        return nodeRepository.findAll();
    }

    // Retrieve a Node by its beaconId
    public Optional<Node> getNodeByBeaconId(String beaconId) {
        return nodeRepository.findByBeaconId(beaconId);
    }

    // Update an existing Node (throws exception if not found)
    public Node updateNode(Long id, Node node) {
        if (nodeRepository.findById(id).isPresent()) {
            node.setId(id);
            return nodeRepository.save(node);
        }
        throw new NoSuchElementException("Node not found with id: " + id);
    }

    // Delete a Node entry by its id
    public void deleteNode(Long id) {
        nodeRepository.deleteById(id);
    }

    private Specification<Node> buildContainsSpecification(List<String> keywords) {
        return (root, query, cb) -> {
            root.fetch("mapData", JoinType.LEFT);
            query.distinct(true);

            Join<Object, Object> joinMapData = root.join("mapData", JoinType.LEFT);

            List<Predicate> orPreds = new ArrayList<>();
            for (String keyword : keywords) {
                if (!StringUtils.hasText(keyword)) continue;
                String pattern = "%" + keyword + "%";
                Predicate pNode = cb.like(cb.lower(root.get("name")), pattern);
                Predicate pMap  = cb.like(cb.lower(joinMapData.get("name")), pattern);
                orPreds.add(cb.or(pNode, pMap));
            }
            return cb.or(orPreds.toArray(new Predicate[0]));
        };
    }

    public List<NodeMapDataSearchResultDTO> searchByText(String inputText, int maxResults) {
        if (!StringUtils.hasText(inputText)) {
            return Collections.emptyList();
        }

        String[] parts = inputText.trim().toLowerCase().split("\\s+");
        List<String> keywords = Arrays.stream(parts)
                .filter(s -> s.trim().length() > 0)
                .collect(Collectors.toList());

        if (keywords.isEmpty()) {
            return Collections.emptyList();
        }

        List<Node> candidates = nodeRepository.findAll(buildContainsSpecification(keywords));

        List<PairScore> scoredList = new ArrayList<>();
        for (Node node : candidates) {
            int count = 0;
            String nodeName = node.getName() != null ? node.getName().toLowerCase() : "";
            String mapName  = (node.getMapData() != null && node.getMapData().getName() != null)
                    ? node.getMapData().getName().toLowerCase()
                    : "";

            for (String kw : keywords) {
                if (nodeName.contains(kw)) count++;
                if (mapName.contains(kw))  count++;
            }
            scoredList.add(new PairScore(node, count));
        }

        List<Node> ordered = scoredList.stream()
                .sorted((a, b) -> {
                    int cmp = Integer.compare(b.getScore(), a.getScore());
                    if (cmp != 0) return cmp;
                    return a.getNode().getId().compareTo(b.getNode().getId());
                })
                .map(ps -> ps.getNode())
                .collect(Collectors.toList());

        if (ordered.size() > maxResults) {
            ordered = ordered.subList(0, maxResults);
        }

        List<NodeMapDataSearchResultDTO> resultsDTO = new ArrayList<>();
        for (Node node : ordered) {
            NodeDTO nodeDto = dataMapper.toNodeDTO(node);
            MapDataDTO mapDto = dataMapper.toMapDataDTO(node.getMapData());
            int sc = scoredList.stream()
                    .filter(x -> x.getNode().getId().equals(node.getId()))
                    .findFirst()
                    .map(x -> x.getScore())
                    .orElse(0);

            resultsDTO.add(new NodeMapDataSearchResultDTO(nodeDto, mapDto, sc));
        }

        return resultsDTO;
    }

    private Specification<Node> buildExitNodesSpecification(Long mapDataId) {
        return (Root<Node> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            // Hacemos fetch de mapData para evitar N+1 y marcamos distinct
            root.fetch("mapData", JoinType.LEFT);
            query.distinct(true);

            // Join a MapData para poder comparar su id
            Join<Node, MapData> joinMapData = root.join("mapData", JoinType.LEFT);

            // Predicado: mapData.id = :mapDataId
            Predicate pMapId = cb.equal(joinMapData.get("id"), mapDataId);

            // Predicado: isExit = true
            Predicate pIsExit = cb.isTrue(root.get("isExit"));

            // Combinamos ambos con AND
            return cb.and(pMapId, pIsExit);
        };
    }

    public List<NodeDTO> findExitNodesByMapData(Long mapDataId) {
        if (mapDataId == null) {
            return List.of();
        }

        List<Node> exitNodes = nodeRepository.findAll(
                buildExitNodesSpecification(mapDataId)
        );

        return exitNodes.stream()
                .map(dataMapper::toNodeDTO)
                .toList();
    }


}
