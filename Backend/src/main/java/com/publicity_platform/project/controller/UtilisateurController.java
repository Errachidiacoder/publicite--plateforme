package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.UtilisateurDto;
import com.publicity_platform.project.service.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UtilisateurController {

    private final UtilisateurService service;

    public UtilisateurController(UtilisateurService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDto> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(service.getUserProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurDto> updateProfile(@PathVariable Long id, @RequestBody UtilisateurDto dto) {
        return ResponseEntity.ok(service.updateProfile(id, dto));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        service.changePassword(id, passwords.get("oldPassword"), passwords.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
