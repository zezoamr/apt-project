package com.yourtodaytip;

import com.yourtodaytip.models.Document;
import com.yourtodaytip.models.User;
import com.yourtodaytip.repository.DocumentRepository;
import com.yourtodaytip.service.impl.DocumentServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Here we are testing the Document class and its methods

@SpringBootTest
public class DocumentTest {

        @Test
        void testDocument() {
            User user = new User("name", "mail1", "pass");
            Document document = new Document("title", "content", user, null, null);
            assert(document.getTitle().equals("title"));
            assert(document.getContent().equals("content"));
            assert(document.getOwner().equals(user));
        }

        @Test
        void testDocumentService() {
            User user = new User("test", "test", "test");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            assert(document.getTitle().equals("title1"));
            assert(document.getOwner().equals(user));
        }

        @Test
        void testEditViewers() {
            User user = new User("test", "test", "test");
            User user2 = new User("test2", "test2", "test2");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            documentService.shareDocument("title1", user, user2, "view");
            assert(document.getViewers().contains(user2));
            documentService.removePermission("title1", user, user2, "view");
            assert(!document.getViewers().contains(user2));
        }

        @Test
        void testEditEditors() {
            User user = new User("test", "test", "test");
            User user2 = new User("test2", "test2", "test2");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            documentService.shareDocument("title1", user, user2, "edit");
            assert(document.getEditors().contains(user2));
            documentService.removePermission("title1", user, user2, "edit");
            assert(!document.getEditors().contains(user2));
        }

        @Test
        void testRenameDocument() {
            User user = new User("test", "test", "test");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            documentService.renameDocument("title1", "title2", user);
            assert(document.getTitle().equals("title2"));
        }

        @Test
        void testDeleteDocument() {
            User user = new User("test", "test", "test");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            documentService.deleteDocument("title1", user);
            assert(documentService.getAllDocuments(user).isEmpty());
        }

        @Test
        void testGetAllDocuments() {
            User user = new User("test", "test", "test");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            assert(documentService.getAllDocuments(user).contains(document));
        }

        @Test
        void testGetOwnedDocuments() {
            User user = new User("test", "test", "test");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            assert(documentService.getOwnedDocuments(user).contains(document));
        }

        @Test
        void testGetSharedDocuments() {
            User user = new User("test", "test", "test");
            User user2 = new User("test2", "test2", "test2");
            DocumentServiceImpl documentService = new DocumentServiceImpl();
            Document document = documentService.createDocument("title1", user);
            documentService.shareDocument("title1", user, user2, "view");
            assert (documentService.getSharedDocuments(user).contains(document));
        }




}