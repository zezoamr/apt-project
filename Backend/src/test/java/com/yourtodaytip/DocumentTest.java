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



}