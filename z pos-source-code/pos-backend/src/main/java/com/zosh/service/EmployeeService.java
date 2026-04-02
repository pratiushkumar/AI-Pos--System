package com.zosh.service;

import com.zosh.domain.UserRole;
import com.zosh.modal.User;
import com.zosh.payload.dto.UserDTO;

import java.util.List;

public interface EmployeeService {
    UserDTO createStoreEmployee(UserDTO employee, @org.springframework.lang.NonNull Long storeId) throws Exception;
    User createBranchEmployee(User employee, @org.springframework.lang.NonNull Long branchId) throws Exception;
    User updateEmployee(@org.springframework.lang.NonNull Long employeeId, User employeeDetails) throws Exception;
    void deleteEmployee(@org.springframework.lang.NonNull Long employeeId) throws Exception;
    User findEmployeeById(@org.springframework.lang.NonNull Long employeeId) throws Exception;
    List<User> findStoreEmployees(@org.springframework.lang.NonNull Long storeId, UserRole role) throws Exception;
    List<User> findBranchEmployees(@org.springframework.lang.NonNull Long branchId, UserRole role) throws Exception;
}