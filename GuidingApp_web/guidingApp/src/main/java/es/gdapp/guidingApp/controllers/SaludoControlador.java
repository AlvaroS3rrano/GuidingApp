package es.gdapp.guidingApp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SaludoControlador {

    @GetMapping("/saludo")
    public String saludo(Model model){
        model.addAttribute("message", "Hola mundo!");
        return "saludo";
    }
    
}
