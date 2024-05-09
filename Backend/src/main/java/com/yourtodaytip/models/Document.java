package com.yourtodaytip.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.springframework.data.util.Pair;
import java.util.List;

@Entity
@Data
@Table(name = "documents")
@ToString

public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;

    private String content;

    @ManyToOne
    private User owner;

    @ManyToMany
    private List<User> editors;

    @ManyToMany
    private List<User> viewers;


    // Constructors

    public Document() {
    }

    public Document(int id, String title, String content, User owner, List<User> editors, List<User> viewers) {
        this.id = id;
        this.title = title;
        this.content = content; //instead of text change to a datastructure 
        this.owner = owner;
        this.editors = editors;
        this.viewers = viewers;
    }

    public Document(String title, String content, User owner, List<User> editors, List<User> viewers) {
        this.title = title;
        this.content = content;
        this.owner = owner;
        this.editors = editors;
        this.viewers = viewers;
    }

    public Document(String title, User owner) {
        this.title = title;
        this.owner = owner;
    }

    // Getter and Setter

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }


    public List<User> getEditors() {
        return editors;
    }

    public void setEditors(List<User> editors) {
        this.editors = editors;
    }

    public List<User> getViewers() {
        return viewers;
    }

    public void setViewers(List<User> viewers) {
        this.viewers = viewers;
    }

    // toString() method

    @Override
    public String toString() {
        return "Document{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author=" + author +
                ", editors=" + editors +
                ", viewers=" + viewers +
                '}';
    }

}