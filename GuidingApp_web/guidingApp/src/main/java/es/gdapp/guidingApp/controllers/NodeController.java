package es.gdapp.guidingApp.controllers;

import es.gdapp.guidingApp.models.Node;
import es.gdapp.guidingApp.services.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/nodes")
public class NodeController {

    private final NodeService nodeService;

    @Autowired
    public NodeController(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @GetMapping
    public String listNodes(@RequestParam("mapId") Long mapId, Model model) {
        Collection<Node> allNodes = nodeService.getAllNodes();
        List<Node> nodesForMap = allNodes.stream()
                .filter(node -> node.getMap().getId().equals(mapId))
                .collect(Collectors.toList());
        model.addAttribute("nodes", nodesForMap);
        model.addAttribute("mapId", mapId);
        return "nodes/list";
    }

    // Se mantiene para quienes quieran acceder al formulario en una página separada
    @GetMapping("/new")
    public String newNodeForm(@RequestParam("mapId") Long mapId, Model model) {
        Node node = new Node();
        //node.setMapId(mapId);
        model.addAttribute("node", node);
        return "nodes/form";
    }

    // Endpoint para crear un nodo vía AJAX (desde el popup modal)
    @PostMapping("/new")
    @ResponseBody
    public Map<String, Object> createNode(@ModelAttribute("node") Node node) {
        nodeService.saveNode(node);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mapId", node.getMap().getId());
        return response;
    }

    // Se mantiene para acceder al formulario de edición en una página aparte
    @GetMapping("/edit")
    public String editNodeForm(@RequestParam("id") Long id, Model model) {
        Node node = nodeService.getNodeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nodo no encontrado con id: " + id));
        model.addAttribute("node", node);
        return "nodes/form";
    }

    // Endpoint para actualizar un nodo vía AJAX (desde el popup modal)
    @PostMapping("/edit")
    @ResponseBody
    public Map<String, Object> updateNode(@ModelAttribute("node") Node node) {
        nodeService.updateNode(node.getId(), node);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mapId", node.getMap().getId());
        return response;
    }

    // Endpoint para eliminar un nodo vía AJAX (opcional)
    @GetMapping("/delete")
    @ResponseBody
    public Map<String, Object> deleteNode(@RequestParam("id") Long id, @RequestParam("mapId") Long mapId) {
        nodeService.deleteNode(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mapId", mapId);
        return response;
    }
}
