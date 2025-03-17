package es.gdapp.guidingApp.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PartialController {
    @GetMapping("/partials/nodeModal")
    public String getNodeModal() {
        return "partials/nodeModal";
    }

    @GetMapping("/partials/confirmModal")
    public String getConfirmModal() {
        return "partials/confirmModal";
    }
}

