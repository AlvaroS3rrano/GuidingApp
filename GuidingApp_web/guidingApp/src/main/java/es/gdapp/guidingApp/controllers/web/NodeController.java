package es.gdapp.guidingApp.controllers.web;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.NodeService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Controller
@RequestMapping("/nodes")
public class NodeController {

    private final NodeService nodeService;

    // Use an AtomicLong to generate temporary IDs for nodes that haven't been persisted.
    private final AtomicLong tempIdGenerator = new AtomicLong(-1);

    @Autowired
    public NodeController(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @GetMapping
    public String listNodes(@RequestParam("mapId") Long mapId, Model model, HttpSession session) {
        MapData tempMapData = (MapData) session.getAttribute("tempMapData");
        if (tempMapData != null) {
            model.addAttribute("nodes", tempMapData.getNodes());
        } else {
            model.addAttribute("nodes", new ArrayList<Node>());
        }
        model.addAttribute("mapId", mapId);
        return "nodes/list";
    }

    // (Optional) For a separate new node form page
    @GetMapping("/new")
    public String newNodeForm(@RequestParam("mapId") Long mapId, Model model) {
        Node node = new Node();
        model.addAttribute("node", node);
        return "nodes/form";
    }

    /**
     * Endpoint to create a node via AJAX (from the popup modal) in transient mode.
     * The node is added to the temporary MapData stored in the session.
     */
    @PostMapping("/new")
    @ResponseBody
    public Map<String, Object> createNode(@ModelAttribute("node") Node node, HttpSession session) {
        MapData tempMapData = (MapData) session.getAttribute("tempMapData");
        if (tempMapData == null) {
            throw new RuntimeException("No MapData available in session. Reload the map edit page.");
        }
        if (!tempMapData.isPointInMatrix(node.getY(), node.getX())) {
            throw new RuntimeException("Coordinates (" + node.getX() + ", " + node.getY() + ") are out of matrix bounds.");
        }
        // Assign a temporary ID if not present (e.g., negative values)
        if (node.getId() == null) {
            node.setId(tempIdGenerator.getAndDecrement());
        }
        // Bind the node to the transient MapData (do not persist yet)
        node.setMap(tempMapData);
        if (tempMapData.getNodes() == null) {
            tempMapData.setNodes(new ArrayList<>());
        }
        tempMapData.getNodes().add(node);
        session.setAttribute("tempMapData", tempMapData);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("redirectUrl", "/mapData/edit/" + tempMapData.getId() + "?tab=nodes");
        return response;
    }

    /**
     * Endpoint to update a node via AJAX (from the popup modal) in transient mode.
     * The method finds the node in the temporary MapData instance and updates its fields.
     */
    @PostMapping("/edit")
    @ResponseBody
    public Map<String, Object> updateNode(@ModelAttribute("node") Node updatedNode, HttpSession session) {
        MapData tempMapData = (MapData) session.getAttribute("tempMapData");
        if (tempMapData == null || tempMapData.getNodes() == null) {
            throw new RuntimeException("No MapData available in session.");
        }
        if (!tempMapData.isPointInMatrix(updatedNode.getY(), updatedNode.getX())) {
            throw new RuntimeException("Coordinates (" + updatedNode.getX() + ", " + updatedNode.getY() + ") are out of matrix bounds.");
        }
        boolean found = false;
        for (Node node : tempMapData.getNodes()) {
            if (node.getId() != null && node.getId().equals(updatedNode.getId())) {
                node.setName(updatedNode.getName());
                node.setBeaconId(updatedNode.getBeaconId());
                node.setX(updatedNode.getX());
                node.setY(updatedNode.getY());
                found = true;
                break;
            }
        }
        if (!found) {
            throw new RuntimeException("Node not found in temporary MapData.");
        }
        session.setAttribute("tempMapData", tempMapData);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("redirectUrl", "/mapData/edit/" + tempMapData.getId() + "?tab=nodes");
        return response;
    }

    /**
     * Endpoint to delete a node via AJAX in transient mode.
     * Removes the node from the temporary MapData instance.
     */
    @GetMapping("/delete")
    @ResponseBody
    public Map<String, Object> deleteNode(@RequestParam("id") Long nodeId, HttpSession session) {
        MapData tempMapData = (MapData) session.getAttribute("tempMapData");
        if (tempMapData == null || tempMapData.getNodes() == null) {
            throw new RuntimeException("No MapData available in session.");
        }
        boolean removed = tempMapData.getNodes().removeIf(n -> n.getId() != null && n.getId().equals(nodeId));
        session.setAttribute("tempMapData", tempMapData);
        Map<String, Object> response = new HashMap<>();
        response.put("success", removed);
        response.put("mapId", tempMapData.getId());
        return response;
    }
}
