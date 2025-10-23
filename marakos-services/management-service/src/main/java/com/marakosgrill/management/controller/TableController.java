package com.marakosgrill.management.controller;

import com.marakosgrill.management.dto.TableDTO;
import com.marakosgrill.management.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/table")
@RequiredArgsConstructor
@Validated
public class TableController {
    private final TableService tableService;

    @GetMapping("/findAll")
    public ResponseEntity<List<TableDTO>> findAll(@RequestParam(required = false) String status,
                                                  @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(tableService.findAll(status, active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TableDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(tableService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TableDTO> create(@Valid @RequestBody TableDTO dto) {
        return ResponseEntity.ok(tableService.create(dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TableDTO> update(@PathVariable Integer id, @Valid @RequestBody TableDTO dto) {
        return ResponseEntity.ok(tableService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        tableService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

