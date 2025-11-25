package com.marakosgrill.management.controller;

import com.marakosgrill.management.model.TipoEvento;
import com.marakosgrill.management.service.TipoEventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipo-evento")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TipoEventoController {
    
    private final TipoEventoService tipoEventoService;
    
    @GetMapping
    public ResponseEntity<List<TipoEvento>> getAllTiposEvento() {
        List<TipoEvento> tipos = tipoEventoService.getAllTiposEvento();
        return ResponseEntity.ok(tipos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TipoEvento> getTipoEventoById(@PathVariable Integer id) {
        TipoEvento tipo = tipoEventoService.getTipoEventoById(id);
        return ResponseEntity.ok(tipo);
    }
}
