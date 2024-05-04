package com.yourtodaytip.service;

import com.yourtodaytip.controller.Request.UserRequest;
import com.yourtodaytip.models.Role;
import com.yourtodaytip.models.User;
import org.springframework.security.core.userdetails.UserDetailsService;

/*
 * @created 06/07/2023 - 10:08 AM
 * @project Facebook-Clone-Java
 * @author Yosef Adel Mahmoud Saaid
 */
public interface UserService extends UserDetailsService {
    User findByEmail(String email);

    User findById(Long id);
    User addUser(UserRequest user);
    void addRole(Role role);
    public String verifyOTP(String email, String otp);
    void attachRoleToUser(String userName, String roleName);
}
