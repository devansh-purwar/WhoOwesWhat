package com.splitwise.splitwiseclone.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private Long id;
    private String email;
    private String name;
    private String message;
    private String token;
}
