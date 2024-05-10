package com.yourtodaytip.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.yourtodaytip.models.Document;
import com.yourtodaytip.models.User;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

    Document findByName(String name);

    List<Document> findAll();

    List<Document> findByOwner(User owner);

    List<Document> findBySharedWith(User sharedWith);
}

