package com.marakosgrill.payment.dto;

import lombok.Data;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
public class CulqiTokenRequest {
    @JsonProperty("card_number")
    private String cardNumber;
    
    @JsonProperty("cvv")
    private String cvv;
    
    @JsonProperty("expiration_month")
    private String expirationMonth;
    
    @JsonProperty("expiration_year")
    private String expirationYear;
    
    @JsonProperty("email")
    private String email;
}