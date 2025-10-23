package com.marakosgrill.management.service.impl;

import com.marakosgrill.management.dto.CategoryDTO;
import com.marakosgrill.management.model.Category;
import com.marakosgrill.management.repository.CategoryRepository;
import com.marakosgrill.management.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryDTO> findAll(String name, Boolean active) {
        return categoryRepository.findAll().stream()
                .filter(c -> (name == null || c.getName().contains(name)) && (active == null || active.equals(c.getActive())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO findById(Integer id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        return toDTO(category);
    }

    @Override
    @Transactional
    public CategoryDTO create(CategoryDTO dto) {
        Category category = toEntity(dto);
        category.setCreatedAt(java.time.LocalDateTime.now());
        category.setActive(true);
        return toDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryDTO update(Integer id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setUpdatedBy(dto.getUpdatedBy());
        category.setUpdatedAt(java.time.LocalDateTime.now());
        category.setActive(dto.getActive());
        return toDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setActive(false);
        categoryRepository.save(category);
    }

    private CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdBy(category.getCreatedBy())
                .updatedBy(category.getUpdatedBy())
                .active(category.getActive())
                .build();
    }

    private Category toEntity(CategoryDTO dto) {
        return Category.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .createdBy(dto.getCreatedBy())
                .updatedBy(dto.getUpdatedBy())
                .active(dto.getActive())
                .build();
    }
}

