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
public class ServiceDTO {
    private Integer id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 200)
    private String description;

    @Size(max = 20)
    private String unit;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @Size(max = 10)
    private String icon;

    @Size(max = 20)
    private String status;

    private Integer createdBy;

    private Integer updatedBy;

    @NotNull
    private Boolean active;
}
