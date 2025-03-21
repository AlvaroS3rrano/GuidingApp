package es.gdapp.guidingApp.controllers.web;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.services.MapDataService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Controller
public class MapDataController {

    private final MapDataService mapDataService;

    @Autowired
    public MapDataController(MapDataService mapDataService) {
        this.mapDataService = mapDataService;
    }

    private final AtomicLong tempIdGenerator = new AtomicLong(-1);

    @GetMapping("/mapData")
    public String getMapDataList(Model model) {
        model.addAttribute("mapDataList", mapDataService.getAllMapData());
        return "mapData";
    }

    @GetMapping("/mapData/new")
    public String newMapData(Model model, HttpSession session) {
        MapData mapData = initializeNewMapData();
        session.setAttribute("tempMapData", mapData);
        populateModelWithMapData(model, mapData);
        return "editMapData";
    }

    @GetMapping("/mapData/edit/{id}")
    public String editMapData(@PathVariable Long id, Model model, HttpSession session) {
        MapData mapData = (MapData) session.getAttribute("tempMapData");
        if (mapData == null || !mapData.getId().equals(id)) {
            mapData = mapDataService.getMapDataById(id)
                    .orElseThrow(() -> new RuntimeException("MapData not found with id: " + id));
            // Initialize the nodes list if null to prevent errors in the view
            if (mapData.getNodes() == null) {
                mapData.setNodes(new ArrayList<>());
            }
            session.setAttribute("tempMapData", mapData);
        }
        populateModelWithMapData(model, mapData);
        return "editMapData";
    }


    /**
     * Endpoint to apply matrix modifications.
     * The changes are applied to the MapData object stored in the session,
     * updating the SVG preview without persisting the changes in the database.
     */
    @PostMapping("/mapData/modifyMatrix")
    @ResponseBody
    public Map<String, Object> modifyMatrix(HttpServletRequest request, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Long id = Long.parseLong(request.getParameter("id"));
        String coordinatesStr = request.getParameter("coordinates"); // Expected format: one coordinate per line "x,y"
        int fillValue = Integer.parseInt(request.getParameter("fillValue"));

        List<List<Integer>> coordinates = parseCoordinates(coordinatesStr);
        MapData mapData = (MapData) session.getAttribute("tempMapData");
        if (mapData == null || !mapData.getId().equals(id)  && id >= 0) {
            mapData = mapDataService.getMapDataById(id)
                    .orElseThrow(() -> new RuntimeException("MapData not found with id: " + id));
            session.setAttribute("tempMapData", mapData);
        }

        mapData.connectCoordinates(coordinates, fillValue);

        session.setAttribute("tempMapData", mapData);
        response.put("success", true);
        response.put("matrixSVG", mapData.getMatrixSVG());
        return response;
    }


    /**
     * Saves all changes made to the MapData (including nodes) into the database.
     * It retrieves the working instance from the session, updates its fields from the form,
     * and then persists the changes.
     */
    @PostMapping("/mapData/update")
    public String updateMapData(
            @ModelAttribute MapData formMapData,
            @RequestParam(name = "newRows", required = false) Integer newRows,
            @RequestParam(name = "newCols", required = false) Integer newCols,
            HttpSession session,
            Model model) {

        MapData tempMapData = (MapData) session.getAttribute("tempMapData");
        if (tempMapData != null) {
            // Update primary attributes from the submitted form
            tempMapData.setName(formMapData.getName());
            tempMapData.setNorthAngle(formMapData.getNorthAngle());

            // If matrix size has changed, resize the matrix (nodes remain attached)
            if (newRows != null && newCols != null &&
                    (newRows != tempMapData.getMatrix().length || newCols != tempMapData.getMatrix()[0].length)) {
                tempMapData.resizeMatrix(newRows, newCols);
            }

            // Before saving, iterate through nodes and set temporary (negative) IDs to null
            if (tempMapData.getNodes() != null) {
                tempMapData.getNodes().forEach(node -> {
                    if (node.getId() != null && node.getId() < 0) {
                        node.setId(null);
                    }
                });
            }

            MapData updatedMapData;

            if (tempMapData.getId() == null || tempMapData.getId() < 0) {
                tempMapData.setId(null);
                updatedMapData = mapDataService.saveMapData(tempMapData);
            } else {
                mapDataService.updateMapData(tempMapData.getId(), tempMapData);
                updatedMapData = mapDataService.getMapDataById(tempMapData.getId())
                        .orElseThrow(() -> new RuntimeException("MapData not found with id: " + tempMapData.getId()));
            }

            // Refresh the session working instance with the updated entity
            session.setAttribute("tempMapData", updatedMapData);
            populateModelWithMapData(model, tempMapData);
        }
        return "redirect:/mapData/edit/" + tempMapData.getId() + "?tab=generalInfo";
    }

    @PostMapping("/mapData/delete")
    @ResponseBody
    public Map<String, Object> deleteMapData(@RequestParam("id") Long mapDataId, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            mapDataService.deleteMapData(mapDataId);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("errorMessage", e.getMessage());
        }
        return response;
    }

    @Transactional
    @PostMapping("/mapData/discardChanges")
    @ResponseBody
    public Map<String, Object> discardChanges(HttpSession session) {
        MapData tempMapData = (MapData) session.getAttribute("tempMapData");
        if (tempMapData == null) {
            throw new RuntimeException("No MapData available in session.");
        }

        MapData freshMapData;

        if (tempMapData.getId() == null || tempMapData.getId() < 0) {
            freshMapData = initializeNewMapData();
        } else {
            freshMapData = mapDataService.getMapDataById(tempMapData.getId())
                    .orElseThrow(() -> new RuntimeException("MapData not found with id: " + tempMapData.getId()));
        }


        // Force initialization of the nodes collection while the session is still open
        if (freshMapData.getNodes() != null) {
            freshMapData.getNodes().size();
        }

        // Update the session with the fresh, persistent MapData
        session.setAttribute("tempMapData", freshMapData);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mapDataId", freshMapData.getId());
        return response;
    }

    /**
     * Helper method to parse a multiline coordinates string into a list of coordinate pairs.
     * Expected format per line: "y,x" (e.g., "0,1").
     *
     * @param coordinatesStr The string containing the coordinates.
     * @return A list of coordinates, each represented as a List<Integer> [y, x].
     */
    private List<List<Integer>> parseCoordinates(String coordinatesStr) {
        List<List<Integer>> coordinates = new ArrayList<>();
        String[] lines = coordinatesStr.split("\\r?\\n");
        for (String line : lines) {
            if (!line.trim().isEmpty()) {
                String[] parts = line.split(",");
                if (parts.length == 2) {
                    try {
                        int y = Integer.parseInt(parts[0].trim());
                        int x = Integer.parseInt(parts[1].trim());
                        coordinates.add(Arrays.asList(y, x));
                    } catch (NumberFormatException e) {
                        throw new RuntimeException("Invalid coordinate format: " + line);
                    }
                }
            }
        }
        return coordinates;
    }

    /**
     * Helper method to populate the model with MapData attributes.
     *
     * @param model   the model to populate
     * @param mapData the MapData object with the data
     */
    private void populateModelWithMapData(Model model, MapData mapData) {
        // Force initialization of the nodes collection
        if (mapData.getNodes() != null) {
            mapData.getNodes().size();
        }

        model.addAttribute("id", mapData.getId());
        model.addAttribute("name", mapData.getName());
        model.addAttribute("northAngle", mapData.getNorthAngle());
        model.addAttribute("matrixSVG", mapData.getMatrixSVG());
        model.addAttribute("matrixRows", mapData.getMatrix().length);
        model.addAttribute("matrixCols", mapData.getMatrix()[0].length);
        model.addAttribute("nodes", mapData.getNodes());
    }

    private MapData initializeNewMapData() {
        MapData mapData = new MapData();
        mapData.setId(tempIdGenerator.getAndDecrement());
        int defaultRows = 10, defaultCols = 10;
        int[][] defaultMatrix = new int[defaultRows][defaultCols];
        mapData.setMatrix(defaultMatrix);
        mapData.setNodes(new ArrayList<>());
        mapData.setName("");
        mapData.setNorthAngle(0);
        return mapData;
    }


}
