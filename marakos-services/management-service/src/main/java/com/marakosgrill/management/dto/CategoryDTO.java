package com.marakosgrill.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private Integer id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 200)
    private String description;

    private Integer createdBy;

    private Integer updatedBy;

    @NotNull
    private Boolean active;
}

