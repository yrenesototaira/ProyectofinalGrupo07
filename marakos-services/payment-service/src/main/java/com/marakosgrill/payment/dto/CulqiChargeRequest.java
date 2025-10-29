package com.marakosgrill.payment.dto;

import lombok.Data;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
public class CulqiChargeRequest {
    @JsonProperty("amount")
    private Integer amount; // Amount in cents (centavos)
    
    @JsonProperty("currency_code")
    private String currencyCode; // "PEN" for Peru
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("source_id")
    private String sourceId; // Token ID from token creation
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("order_id")
    private String orderId; // Internal order reference
    
    @JsonProperty("client_details")
    private ClientDetails clientDetails;
    
    @Data
    @Builder
    public static class ClientDetails {
        @JsonProperty("first_name")
        private String firstName;
        
        @JsonProperty("last_name")
        private String lastName;
        
        @JsonProperty("email")
        private String email;
        
        @JsonProperty("phone_number")
        private String phoneNumber;
    }
}