package com.yourtodaytip.controller.Request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OTPRequest {
    private String email;
    private String otp;
}
