package soundhub.controllers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import soundhub.dtos.*;
import soundhub.services.AuthService;

import soundhub.entities.Users;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody ChangePasswordRequest request) {
        try {
            String username = authentication.getName(); // JWT already verified here
            authService.changePassword(username, request);
            return ResponseEntity.ok("Password updated successfully");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Unexpected error"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String username = authentication.getName();
            return ResponseEntity.ok(authService.getCurrentUser(username));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Unexpected error"));
        }
    }

    // Simple DTO for error messages
    @Data
    @AllArgsConstructor
    static class ErrorResponse {
        private String message;
    }
}
