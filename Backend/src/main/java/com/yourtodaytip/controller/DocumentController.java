package com.yourtodaytip.controller;

import com.yourtodaytip.models.User;
import com.yourtodaytip.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.yourtodaytip.models.Document;
import com.yourtodaytip.service.DocumentService;
import java.util.List;


@RestController
@RequestMapping("api/v1/document")
@RequiredArgsConstructor
@CrossOrigin(origins="*",allowedHeaders = "*")
public class DocumentController {
    private final DocumentService documentService;
    private final UserService userService;

    @GetMapping("/all")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public List<Document> getAllDocuments(Authentication authentication){
        return documentService.getAllDocuments((User) authentication.getPrincipal());
    }

    @GetMapping("/owned")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public List<Document> getOwnedDocuments(Authentication authentication){
        return documentService.getOwnedDocuments((User) authentication.getPrincipal());
    }

    @GetMapping("/shared")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public List<Document> getSharedDocuments(Authentication authentication){
        return documentService.getSharedDocuments((User) authentication.getPrincipal());
    }

    @PostMapping("/create/{name}")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public Document createDocument(@PathVariable("name") String name, Authentication authentication){
        return documentService.createDocument(name, (User) authentication.getPrincipal());
    }

    @PostMapping("/open/{name}")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public Document openDocument(@PathVariable("name") String name, Authentication authentication){
        return documentService.openDocument(name, (User) authentication.getPrincipal());
    }

    @PostMapping("/rename/{oldName}/{newName}")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public Document renameDocument(@PathVariable("oldName") String oldName, @PathVariable("newName") String newName, Authentication authentication){
        return documentService.renameDocument(oldName, newName, (User) authentication.getPrincipal());
    }

    @PostMapping("/delete/{name}")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public void deleteDocument(@PathVariable("name") String name, Authentication authentication){
        documentService.deleteDocument(name, (User) authentication.getPrincipal());
    }

    @PostMapping("/share/{name}/{email}/{permission}")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public void shareDocument(@PathVariable("name") String name, @PathVariable("email") String email, @PathVariable("permission") String permission, Authentication authentication){
        documentService.shareDocument(name, (User) authentication.getPrincipal(), userService.findByEmail(email), permission);
    }

    @PostMapping("/changePermission/{name}/{email}/{permission}")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public void changePermission(@PathVariable("name") String name, @PathVariable("email") String email, @PathVariable("permission") String permission, Authentication authentication){
        documentService.changePermission(name, (User) authentication.getPrincipal(), userService.findByEmail(email), permission);
    }

    @PostMapping("/removePermission/{name}/{email}/{permission}")
    @CrossOrigin(origins="*",allowedHeaders = "*")
    public void removePermission(@PathVariable("name") String name, @PathVariable("email") String email, @PathVariable("permission") String permission, Authentication authentication){
        documentService.removePermission(name, (User) authentication.getPrincipal(), userService.findByEmail(email), permission);
    }

}
