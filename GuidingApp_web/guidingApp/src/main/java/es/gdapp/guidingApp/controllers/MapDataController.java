package es.gdapp.guidingApp.controllers;

import es.gdapp.guidingApp.services.MapDataService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

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
}
