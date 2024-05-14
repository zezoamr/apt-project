package com.yourtodaytip.models;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;


@Slf4j
@Getter
@Setter
@AllArgsConstructor
@Table
@Entity
@RequiredArgsConstructor
public class Operation {
    String insert;
    int retain;
    @Nullable
    @OneToMany
    List<Attribute> attributes = new ArrayList<>();
    @Setter
    @Getter
    @Id
    private Long id;

}
