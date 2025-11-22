package soundhub.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import soundhub.dtos.AudioPostRequest;
import soundhub.dtos.AudioPostResponse;
import soundhub.dtos.ErrorResponse;
import soundhub.entities.Users;
import soundhub.repositories.UserRepository;
import soundhub.services.AudioPostService;

import java.util.List;

@RestController
@RequestMapping("/audio-posts")
@RequiredArgsConstructor
public class AudioPostController {

    private final AudioPostService audioPostService;
    private final UserRepository userRepository;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> uploadAudioPost(Authentication authentication, @ModelAttribute AudioPostRequest request) {
        try {
            String username = authentication.getName();
            Users user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            return ResponseEntity.ok(audioPostService.uploadAudioPost(user.getId(), request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body(new ErrorResponse("Unexpected error: " + ex.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AudioPostResponse>> getUserAudioPosts(@PathVariable int userId) {
        return ResponseEntity.ok(audioPostService.getUserAudioPosts(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAudioPost(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(audioPostService.getAudioPost(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAudioPost(Authentication authentication, @PathVariable Long id) {
        try {
            String username = authentication.getName();
            Users user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            audioPostService.deleteAudioPost(user.getId(), id);
            return ResponseEntity.ok("Deleted successfully");
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(new ErrorResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Unexpected error"));
        }
    }
}
