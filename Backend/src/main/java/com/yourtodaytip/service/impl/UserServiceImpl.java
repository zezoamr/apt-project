package com.yourtodaytip.service.impl;

import com.yourtodaytip.controller.Request.UserRequest;
import com.yourtodaytip.dao.OTPDao;
import com.yourtodaytip.dao.RoleDao;
import com.yourtodaytip.dao.UserDao;
import com.yourtodaytip.exception.DuplicateResourceException;
import com.yourtodaytip.exception.ResourceNotFoundException;
import com.yourtodaytip.models.Role;
import com.yourtodaytip.models.User;
import com.yourtodaytip.service.EmailService;
import com.yourtodaytip.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/*
 * @created 06/07/2023 - 11:53 AM
 * @project Facebook-Clone-Java
 * @author Yosef Adel Mahmoud Saaid
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    @Autowired
    private final UserDao userDao;
    @Autowired
    private final RoleDao roleDao;
    @Autowired
    private OTPDao otpDao;

    @Autowired
    private EmailService emailService;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

  public static String generateOTP()
    {  //int randomPin declared to store the otp
        //since we using Math.random() hence we have to type cast it int
        //because Math.random() returns decimal value
        int randomPin   =(int) (Math.random()*9000)+1000;
        String otp  = String.valueOf(randomPin);
        return otp; //returning value of otp
    }

    @Override
    public User findByEmail(String email) {
        return userDao.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User with email [%s] not found".formatted(email)));
    }

    @Override
    public User findById(Long id) {
        return userDao.getUserById(id).orElseThrow(() -> new ResourceNotFoundException("User with id [%s] not found".formatted(id)));
    }

    @Override
    public User addUser(UserRequest request) {
        if (userDao.isEmailExist(request.getEmail())) {
            throw new DuplicateResourceException("Email Already Exists.....");
        }
        String pass = request.getPassword();
        String hashPass = passwordEncoder.encode(pass);
        request.setPassword(hashPass);
        User newuser = userDao.addUser(new User(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        ));
        this.attachRoleToUser(request.getEmail(), "ROLE_USER");
        String otp = generateOTP();
        //create OTP and send it to the user
        //emailService.sendEmail(request.getEmail(), "YourTodayTip OTP", "Your OTP is:" + otp);
        otpDao.saveOTP(request.getEmail(), otp);

        return newuser;
    }

    @Override
    public String verifyOTP(String email, String otp) {
        String savedOTP = otpDao.getOTP(email).getOtp();
        if (savedOTP == null) {
            throw new ResourceNotFoundException("OTP not found");
        }
        if (!savedOTP.equals(otp)) {

            throw new ResourceNotFoundException("Invalid OTP");
        }
        User u = this.findByEmail(email);
        u.setVerified(true);
        userDao.updateUser(u);
        return "OTP Verified";

    }

    @Override
    public void addRole(Role role) {
        roleDao.addRole(role);
    }


    @Override
    public void attachRoleToUser(String email, String roleName) {
        Role r = roleDao.findRoleByName(roleName);
        System.out.println("attachRoleToUser " + email);
        User u = this.findByEmail(email);
        u.addRole(r);
        userDao.updateUser(u);
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = this.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("Invalid Email or password.");
        }
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), user.mapRolesToAuthorities());
    }


}
