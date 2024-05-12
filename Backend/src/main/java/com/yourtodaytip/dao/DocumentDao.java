package com.yourtodaytip.dao;

import com.yourtodaytip.models.Document;
import com.yourtodaytip.models.User;

import java.util.List;

public interface DocumentDao {
    void save(Document document);
    Document findByName(String name);
    List<Document> findAll();
    void delete(Document document);
}
