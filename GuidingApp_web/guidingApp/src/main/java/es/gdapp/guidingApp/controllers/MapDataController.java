package es.gdapp.guidingApp.controllers;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.services.MapDataService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Controller
public class MapDataController {

    private final MapDataService mapDataService;

    @Autowired
    public MapDataController(MapDataService mapDataService) {
        this.mapDataService = mapDataService;
    }

    @GetMapping("/mapData")
    public String getMapDataList(Model model) {
        model.addAttribute("mapDataList", mapDataService.getAllMapData());
        return "mapData";
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
    public java.util.Map<String, Object> modifyMatrix(HttpServletRequest request, HttpSession session) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        Long id = Long.parseLong(request.getParameter("id"));
        String coordinatesStr = request.getParameter("coordinates"); // Expected format: one coordinate per line "x,y"
        int fillValue = Integer.parseInt(request.getParameter("fillValue"));

        List<List<Integer>> coordinates = parseCoordinates(coordinatesStr);
        MapData mapData = (MapData) session.getAttribute("tempMapData");
        if (mapData == null || !mapData.getId().equals(id)) {
            mapData = mapDataService.getMapDataById(id)
                    .orElseThrow(() -> new RuntimeException("MapData not found with id: " + id));
            session.setAttribute("tempMapData", mapData);
        }

        try {
            mapData.connectCoordinates(coordinates, fillValue);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("errorMessage", e.getMessage());
            return response;
        }

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

            // Persist the complete MapData (including any modifications to nodes)
            mapDataService.updateMapData(tempMapData.getId(), tempMapData);
            // Refresh the session working instance with the updated entity
            session.setAttribute("tempMapData", tempMapData);
            populateModelWithMapData(model, tempMapData);
        }
        return "editMapData";
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
     * @param model the model to populate
     * @param mapData the MapData object with the data
     */
    private void populateModelWithMapData(Model model, MapData mapData) {
        model.addAttribute("id", mapData.getId());
        model.addAttribute("name", mapData.getName());
        model.addAttribute("northAngle", mapData.getNorthAngle());
        model.addAttribute("matrixSVG", mapData.getMatrixSVG());
        model.addAttribute("matrixRows", mapData.getMatrix().length);
        model.addAttribute("matrixCols", mapData.getMatrix()[0].length);
        model.addAttribute("nodes", mapData.getNodes());
    }

}
