package com.yourtodaytip.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.Id;

@Entity
@Table(name = "otp")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OTP {
    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id", nullable = false)
    private Long id;

    private String email;
    private String otp;


    public OTP(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }
}
