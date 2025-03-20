package es.gdapp.guidingApp.controllers.web;

import es.gdapp.guidingApp.models.MapData;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PartialController {
    @GetMapping("/partials/nodeModal")
    public String getNodeModal(HttpSession session, Model model) {
        MapData mapData = (MapData) session.getAttribute("tempMapData");
        if (mapData != null) {
            model.addAttribute("matrixRows", mapData.getMatrix().length);
            model.addAttribute("matrixCols", mapData.getMatrix()[0].length);
            return "partials/nodeModal";
        } else {
            throw new RuntimeException("Map data not found. Please reload the page.");
        }
    }


    @GetMapping("/partials/confirmModal")
    public String getConfirmModal() {
        return "partials/confirmModal";
    }

    @GetMapping("/partials/errorModal")
    public String getErrorModal() {
        return "partials/errorModal";
    }
}

