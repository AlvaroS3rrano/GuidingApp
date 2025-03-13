package es.gdapp.guidingApp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PartialController {
    @GetMapping("/partials/nodeModal")
    public String getNodeModal() {
        return "partials/nodeModal";
    }
}

