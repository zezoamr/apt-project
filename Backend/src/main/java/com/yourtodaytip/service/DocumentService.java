package com.yourtodaytip.service;

import com.yourtodaytip.models.Document;
import com.yourtodaytip.models.User;
import java.util.List;

public interface DocumentService {
    Document createDocument(String name, User owner);

    Document openDocument(String name, User user);

    Document renameDocument(String oldName, String newName, User user);

    void deleteDocument(String name, User user);

    void shareDocument(String name, User user, User shareWith, String permission);

    void changePermission(String name, User user, User shareWith, String permission);

    void removePermission(String name, User user, User shareWith, String permission);

    List<Document> getAllDocuments(User user);

    List<Document> getOwnedDocuments(User user);

    List<Document> getSharedDocuments(User user);


}