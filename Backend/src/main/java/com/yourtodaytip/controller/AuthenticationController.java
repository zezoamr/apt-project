package com.yourtodaytip.controller;

import com.yourtodaytip.config.JwtUtil;
import com.yourtodaytip.controller.Request.OTPRequest;
import com.yourtodaytip.controller.Request.UserRequest;
import com.yourtodaytip.controller.Response.LoginResponse;
import com.yourtodaytip.models.User;
import com.yourtodaytip.service.EmailService;
import com.yourtodaytip.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

/*
 * @created 06/07/2023 - 12:09 PM
 * @project Facebook-Clone-Java
 * @author Yosef Adel Mahmoud Saaid
 */
@RestController
@RequestMapping("api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins="*",allowedHeaders = "*")
public class AuthenticationController {
    @Autowired

    private final AuthenticationManager authenticationManager;
    @Autowired

    private final JwtUtil jwtUtil;
    @Autowired
    private final UserService userService;
    @Autowired
    private final EmailService emailService;

    @PostMapping("/signup")
    public User createUser(@RequestBody UserRequest request) {
        return userService.addUser(request);
    }
    @PostMapping("/sendEmail")
    public String sendEmail() {
         emailService.sendEmail("abdelkhalek2001100@gmail.com","test","test");
            return "Email Sent";
    }


    @PostMapping("/login")
    public LoginResponse login(@RequestBody UserRequest requset) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(requset.getEmail(), requset.getPassword()));
        //
        final User user = userService.findByEmail(requset.getEmail());
//        if(!user.isVerified()){
//          throw new RuntimeException("User is not verified");
//        }
        System.out.println(user.toString());
        String token = jwtUtil.generateToken(user);

        return new LoginResponse(user, token);
    }
    @PostMapping("/verifyOTP")
    public String verifyOTP(@RequestBody OTPRequest otpRequest) {
        return userService.verifyOTP(otpRequest.getEmail(), otpRequest.getOtp());
    }
}
