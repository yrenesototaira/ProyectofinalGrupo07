package com.marakosgrill.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Integer id;

    @NotBlank
    @Size(max = 20)
    private String code;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 200)
    private String description;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @NotNull
    private Integer categoryId;

    @NotNull
    @Min(0)
    private Integer stock;

    @Size(max = 200)
    private String pictureUrl;

    @Size(max = 20)
    private String status;

    private Integer createdBy;

    private Integer updatedBy;

    @NotNull
    private Boolean active;
}

