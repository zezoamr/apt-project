package com.yourtodaytip.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@Table(name = "Document")
@ToString
@RequiredArgsConstructor
public class Document {
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Setter
    @Getter
    private String title;
    @OneToMany
    private List<Operation> operation;
    @Getter
    @ManyToOne
    private User owner;

    @ManyToMany
    private List<User> editors;

    @ManyToMany
    private List<User> viewers;


    // Constructors

    public Document(int id, String title, List<Operation> ops, User owner, List<User> editors, List<User> viewers) {
        this.id = id;
        this.title = title;
        this.operation = ops; //instead of text change to a datastructure
        this.owner = owner;
        this.editors = editors;
        this.viewers = viewers;
    }

    public Document(String title,List<Operation> ops, User owner, List<User> editors, List<User> viewers) {
        this.title = title;
        this.operation = ops;
        this.owner = owner;
        this.editors = editors;
        this.viewers = viewers;
    }

    public Document(String title, User owner) {
        this.title = title;
        this.owner = owner;
    }


}
