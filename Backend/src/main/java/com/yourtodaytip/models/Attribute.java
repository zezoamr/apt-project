package com.yourtodaytip.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Table
@Entity
@RequiredArgsConstructor
public class Attribute {
    String Name;
    String Value;
    @Setter
    @Getter
    @jakarta.persistence.Id
    private Long id;
}
