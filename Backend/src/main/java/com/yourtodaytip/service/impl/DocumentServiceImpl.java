package com.yourtodaytip.service.impl;

import com.yourtodaytip.models.Document;
import com.yourtodaytip.service.DocumentService;
import com.yourtodaytip.dao.DocumentDao;
import com.yourtodaytip.exception.AccessDeniedException;
import com.yourtodaytip.exception.ResourceNotFoundException;
import com.yourtodaytip.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;


// The services are as follows:
// Create a new document, open an existing document, rename a document, and delete a document.
// The service layer is responsible for the business logic of the application.
// We can also define the access control rules in the service layer.
// Owner will have full access to the document and can control sharing and permissions.
// Owner is the only authorized user to delete a document.
// Owner and Editor are authorized to open and rename document.
// Viewer is authorized to open a document only.

@Service
public class DocumentServiceImpl implements DocumentService {
    @Autowired
    private final DocumentDao documentDao;

    @Override
    public Document createDocument(String name, User owner) {
        Document document = new Document(name, owner);
        documentDao.save(document);
        return document;
    }

    @Override
    public Document openDocument(String name, User user) {
        Document document = documentDao.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Document with name [%s] not found".formatted(name)));
        if (document.getOwner().equals(user) || document.getEditors().contains(user) || document.getViewers().contains(user)) {
            return document;
        } else {
            throw new AccessDeniedException("User [%s] does not have access to open document [%s]".formatted(user, name));
        }
    }

    @Override
    public Document renameDocument(String oldName, String newName, User user) {
        Document document = documentDao.findByName(oldName).orElseThrow(() -> new ResourceNotFoundException("Document with name [%s] not found".formatted(oldName)));
        if (document.getOwner().equals(user) || document.getEditors().contains(user)) {
            document.setTitle(newName);
            documentDao.save(document);
            return document;
        } else {
            throw new AccessDeniedException("User [%s] does not have access to rename document [%s]".formatted(user, oldName));
        }
    }

    @Override
    public void deleteDocument(String name, User user) {
        Document document = documentDao.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Document with name [%s] not found".formatted(name)));
        if (document.getOwner().equals(user)) {
            documentDao.delete(document);
        } else {
            throw new AccessDeniedException("User [%s] does not have access to delete document [%s]".formatted(user, name));
        }
    }

    @Override
    public void shareDocument(String name, User user, User shareWith, String permission) {
        Document document = documentDao.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Document with name [%s] not found".formatted(name)));
        if (document.getOwner().equals(user)) {
            if (permission.equals("Editor")) {
                document.getEditors().add(shareWith);
            } else if (permission.equals("Viewer")) {
                document.getViewers().add(shareWith);
            }
}
        documentDao.save(document);
    }

    @Override
    public void changePermission(String name, User user, User shareWith, String permission) {
        Document document = documentDao.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Document with name [%s] not found".formatted(name)));
        if (document.getOwner().equals(user)) {
            if (permission.equals("Editor")) {
                document.getEditors().add(shareWith);
                document.getViewers().remove(shareWith);
            } else if (permission.equals("Viewer")) {
                document.getViewers().add(shareWith);
                document.getEditors().remove(shareWith);
            }
        }
        documentDao.save(document);
    }

    @Override
    public void removePermission(String name, User user, User shareWith, String permission) {
        Document document = documentDao.findByName(name).orElseThrow(() -> new ResourceNotFoundException("Document with name [%s] not found".formatted(name)));
        if (document.getOwner().equals(user)) {
            if (permission.equals("Editor")) {
                document.getEditors().remove(shareWith);
            } else if (permission.equals("Viewer")) {
                document.getViewers().remove(shareWith);
            }
        }
        documentDao.save(document);
    }

    @Override
    public List<Document> getAllDocuments(User user) {
        // return any document the user is the owner, editor or viewer
        List<Document> userDocuments = new ArrayList<Document>();
        for(Document document : documentDao.findAll()) {
            if (document.getOwner().equals(user) || document.getEditors().contains(user) || document.getViewers().contains(user)) {
                userDocuments.add(document);
            }
        }
        return userDocuments;
    }

    @Override
    public List<Document> getUserDocuments(User user) {
        // return any document the user is the owner
        List<Document> userDocuments = new ArrayList<Document>();
        for(Document document : documentDao.findAll()) {
            if (document.getOwner().equals(user)) {
                userDocuments.add(document);
            }
        }
        return userDocuments;
    }

    @Override
    public List<Document> getSharedDocuments(User user) {
        // return any document the user is the editor or viewer
        List<Document> userDocuments = new ArrayList<Document>();
        for(Document document : documentDao.findAll()) {
            if (document.getEditors().contains(user) || document.getViewers().contains(user)) {
                userDocuments.add(document);
            }
        }
        return userDocuments;
    }


}