package es.gdapp.guidingApp.controllers;

import es.gdapp.guidingApp.models.MapData;
import es.gdapp.guidingApp.services.MapDataService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class MapDataController {

    private final MapDataService mapDataService;

    public MapDataController(MapDataService mapDataService) {
        this.mapDataService = mapDataService;
    }

    @GetMapping("/mapData")
    public String getMapDataList(Model model) {
        model.addAttribute("mapDataList", mapDataService.getAllMapData());
        return "mapData";
    }

    @GetMapping("/mapData/edit/{id}")
    public String editMapData(@PathVariable Long id, Model model) {
        MapData mapData = mapDataService.getMapDataById(id)
                .orElseThrow(() -> new RuntimeException("MapData not found with id: " + id));
        model.addAttribute("id", mapData.getId());
        model.addAttribute("name", mapData.getName());
        model.addAttribute("northAngle", mapData.getNorthAngle());
        model.addAttribute("matrixSVG", mapData.getMatrixSVG());
        return "editMapData";
    }
}
