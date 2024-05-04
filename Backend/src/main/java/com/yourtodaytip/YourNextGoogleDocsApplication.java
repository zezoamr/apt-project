package com.yourtodaytip;

import com.yourtodaytip.controller.Request.UserRequest;
import com.yourtodaytip.models.Role;
import com.yourtodaytip.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class YourNextGoogleDocsApplication {

    public static void main(String[] args) {
        SpringApplication.run(YourNextGoogleDocsApplication.class, args);
    }


    @Bean
    CommandLineRunner commandLineRunner(UserService userService) {
        return args -> {

            userService.addRole(new Role("ROLE_USER"));

            UserRequest user = new UserRequest("yosef", "yosef@gmail.com", "fun123");

            userService.addUser(user);

            userService.addRole(new Role("ROLE_ADMIN"));

            userService.attachRoleToUser("yosef@gmail.com", "ROLE_ADMIN");


        };
    }
}
