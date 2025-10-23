package com.marakosgrill.auth.service;

import com.marakosgrill.auth.model.User;

public interface JwtService {
    String generateToken(User user);
}
