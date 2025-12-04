package com.marakosgrill.management.service.impl;

import com.marakosgrill.management.dto.ProductDTO;
import com.marakosgrill.management.dto.ProductPublicDTO;
import com.marakosgrill.management.model.Product;
import com.marakosgrill.management.model.Category;
import com.marakosgrill.management.repository.ProductRepository;
import com.marakosgrill.management.repository.CategoryRepository;
import com.marakosgrill.management.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<ProductDTO> findAll(String name, Integer categoryId, Boolean active) {
        return productRepository.findAll().stream()
                .filter(p -> (name == null || p.getName().contains(name)) && (categoryId == null || (p.getCategory() != null && categoryId.equals(p.getCategory().getId()))) && (active == null || active.equals(p.getActive())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO findById(Integer id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        return toDTO(product);
    }

    @Override
    @Transactional
    public ProductDTO create(ProductDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
        Product product = toEntity(dto);
        product.setCategory(category);
        product.setCreatedAt(java.time.LocalDateTime.now());
        product.setActive(true);
        return toDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductDTO update(Integer id, ProductDTO dto) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategory(category);
        product.setStock(dto.getStock());
        product.setPictureUrl(dto.getPictureUrl());
        product.setStatus(dto.getStatus());
        product.setUpdatedBy(dto.getUpdatedBy());
        product.setUpdatedAt(java.time.LocalDateTime.now());
        product.setActive(dto.getActive());
        return toDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductPublicDTO> findAllPublic() {
        return productRepository.findAll().stream()
            .filter(p -> Boolean.TRUE.equals(p.getActive()))
            .map(p -> ProductPublicDTO.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .pictureUrl(p.getPictureUrl())
                .status(p.getStatus())
                .active(p.getActive())
                .category(ProductPublicDTO.CategoryInfo.builder()
                    .id(p.getCategory() != null ? p.getCategory().getId() : null)
                    .name(p.getCategory() != null ? p.getCategory().getName() : null)
                    .description(p.getCategory() != null ? p.getCategory().getDescription() : null)
                    .build())
                .build())
            .collect(java.util.stream.Collectors.toList());
    }

    private ProductDTO toDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .stock(product.getStock())
                .pictureUrl(product.getPictureUrl())
                .status(product.getStatus())
                .createdBy(product.getCreatedBy())
                .updatedBy(product.getUpdatedBy())
                .active(product.getActive())
                .build();
    }

    private Product toEntity(ProductDTO dto) {
        return Product.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .pictureUrl(dto.getPictureUrl())
                .status(dto.getStatus())
                .createdBy(dto.getCreatedBy())
                .updatedBy(dto.getUpdatedBy())
                .active(dto.getActive())
                .build();
    }
}
