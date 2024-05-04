package com.yourtodaytip.controller.Response;

/*
 * @created 09/07/2023 - 10:20 AM
 * @project Facebook-Clone-Java
 * @author Yosef Adel Mahmoud Saaid
 */

import com.yourtodaytip.models.User;
import lombok.AllArgsConstructor;


@AllArgsConstructor
public class LoginResponse {
    public User user;
    public  String token;


}
