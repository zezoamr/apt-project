package com.yourtodaytip.dao.impl;

import com.yourtodaytip.dao.OTPDao;
import com.yourtodaytip.models.OTP;
import com.yourtodaytip.repository.OTPRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class OTPDaoImpl implements OTPDao {
    private final OTPRepository otpRepository;

    @Override
    public void saveOTP(String email, String otp) {
        new OTP(email, otp);
        otpRepository.save(new OTP(email, otp));

    }

    @Override
    public OTP getOTP(String email) {
      return otpRepository.findByEmail(email);
    }

    @Override
    public void deleteOTP(String email) {

    }
}
