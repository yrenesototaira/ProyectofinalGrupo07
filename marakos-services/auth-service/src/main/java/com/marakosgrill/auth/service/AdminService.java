package com.marakosgrill.auth.service;

import com.marakosgrill.auth.dto.*;

import java.util.List;

public interface AdminService {
    List<UserTypeResponse> getAllUserTypes();
    List<RoleResponse> getAllRoles();
    CreateUserResponse createUser(CreateUserRequest request);
    List<UserListResponse> getAllUsers();
    PagedUserResponse getUsersPaginated(int page, int size, String search);
    void deleteUser(Long userId);
    UserListResponse getUserById(Long userId);
    UserDetailResponse getUserDetailById(Long userId);
    CreateUserResponse updateUser(Long userId, CreateUserRequest request);
}