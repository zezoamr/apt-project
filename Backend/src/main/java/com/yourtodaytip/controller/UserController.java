package com.yourtodaytip.controller;

/*
 * @created 09/07/2023 - 11:54 AM
 * @project Facebook-Clone-Java
 * @author Yosef Adel Mahmoud Saaid
 */

import com.yourtodaytip.models.User;
import com.yourtodaytip.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.lang.model.util.Elements;
import java.util.List;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins="*",allowedHeaders = "*")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @CrossOrigin(origins="*",allowedHeaders = "*")

    public User getMyData(Authentication authentication){
        return ((User) authentication.getPrincipal());
    }

    @GetMapping("{id}")
    @CrossOrigin(origins="*",allowedHeaders = "*")

    public User getUserData(@PathVariable("id") Long id){
        return userService.findById(id);
    }






}
