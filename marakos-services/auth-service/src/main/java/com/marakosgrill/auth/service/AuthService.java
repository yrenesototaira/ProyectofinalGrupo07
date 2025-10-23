package com.marakosgrill.auth.service;

import com.marakosgrill.auth.dto.*;

public interface AuthService {
    AuthLoginResponse login(AuthLoginRequest request);
    AuthRegisterResponse register(AuthRegisterRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}

