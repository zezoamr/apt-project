package com.yourtodaytip.dao;

import com.yourtodaytip.models.OTP;

public interface OTPDao {
    void saveOTP(String email, String otp);
    OTP getOTP(String email);
    void deleteOTP(String email);
}
