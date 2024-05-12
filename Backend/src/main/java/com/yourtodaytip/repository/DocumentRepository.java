package com.yourtodaytip.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.yourtodaytip.models.Document;
import com.yourtodaytip.models.User;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

    Document findByTitle(String title);

    List<Document> findByOwner(User owner);

}

