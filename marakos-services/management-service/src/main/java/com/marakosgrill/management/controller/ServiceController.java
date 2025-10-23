package com.marakosgrill.management.controller;

import com.marakosgrill.management.dto.ServiceDTO;
import com.marakosgrill.management.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/service")
@RequiredArgsConstructor
@Validated
public class ServiceController {
    private final ServiceService serviceService;

    @GetMapping("/findAll")
    public ResponseEntity<List<ServiceDTO>> findAll(@RequestParam(required = false) String name,
                                                    @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(serviceService.findAll(name, active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(serviceService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceDTO> create(@Valid @RequestBody ServiceDTO dto) {
        return ResponseEntity.ok(serviceService.create(dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ServiceDTO> update(@PathVariable Integer id, @Valid @RequestBody ServiceDTO dto) {
        return ResponseEntity.ok(serviceService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
