package com.marakosgrill.management.controller;

import com.marakosgrill.management.dto.ProductDTO;
import com.marakosgrill.management.dto.ProductPublicDTO;
import com.marakosgrill.management.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
@Validated
public class ProductController {
    private final ProductService productService;

    @GetMapping("/findAll")
    public ResponseEntity<List<ProductDTO>> findAll(@RequestParam(required = false) String name,
                                                    @RequestParam(required = false) Integer categoryId,
                                                    @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(productService.findAll(name, categoryId, active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProductDTO> create(@Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.create(dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Integer id, @Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public")
    public ResponseEntity<List<ProductPublicDTO>> getAllPublicProducts() {
        return ResponseEntity.ok(productService.findAllPublic());
    }
}
