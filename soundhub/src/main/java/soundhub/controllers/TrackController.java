package soundhub.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import soundhub.entities.AudioPost;
import soundhub.entities.User;
import soundhub.repositories.AudioPostRepository;
import soundhub.repositories.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class TrackController {

    private final AudioPostRepository audioPostRepository;
    private final UserRepository userRepository;

    @Value("${storage.base-dir}")
    private String baseDir;

    @PostMapping("/tracks/upload")
    public ResponseEntity<?> uploadTrack(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam("cover") MultipartFile coverFile,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("genre") String genre,
            Authentication authentication
    ) {
        try {
            // Validate authentication
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authentication required"));
            }

            // Get the authenticated user
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Validate files
            if (audioFile == null || audioFile.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Audio file is required"));
            }
            
            if (coverFile == null || coverFile.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Cover image is required"));
            }

            // Create directories if they don't exist
            Path audioDir = Paths.get(baseDir, "audio");
            Path coverDir = Paths.get(baseDir, "covers");
            Files.createDirectories(audioDir);
            Files.createDirectories(coverDir);

            // Save Audio File
            String audioFileName = UUID.randomUUID() + "_" + audioFile.getOriginalFilename();
            Path audioPath = audioDir.resolve(audioFileName);
            Files.copy(audioFile.getInputStream(), audioPath);

            // Save Cover File
            String coverFileName = UUID.randomUUID() + "_" + coverFile.getOriginalFilename();
            Path coverPath = coverDir.resolve(coverFileName);
            Files.copy(coverFile.getInputStream(), coverPath);

            // Create AudioPost entity
            AudioPost audioPost = new AudioPost();
            audioPost.setUser(user);
            audioPost.setTitle(title);
            audioPost.setDescription(description);
            audioPost.setGenre(genre);
            audioPost.setAudio_path("audio/" + audioFileName);
            audioPost.setCover_path("covers/" + coverFileName);

            // Save to database
            audioPostRepository.save(audioPost);

            return ResponseEntity.ok(Map.of(
                "message", "Track uploaded successfully",
                "trackId", audioPost.getId(),
                "audioPath", "audio/" + audioFileName,
                "coverPath", "covers/" + coverFileName
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload files: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/tracks/recommended")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedTracks() {
        List<AudioPost> posts = audioPostRepository.findAll();

        String baseUrl = "http://localhost:8082";

        // Map to frontend expected format
        List<Map<String, Object>> result = posts.stream().map(post -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", post.getId());
            map.put("title", post.getTitle());
            map.put("artist", post.getUser().getUsername());
            map.put("coverImage", baseUrl + "/content/" + post.getCover_path());
            map.put("audioUrl", baseUrl + "/content/" + post.getAudio_path());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/track/current")
    public ResponseEntity<Map<String, Object>> getCurrentTrack() {
        String baseUrl = "http://localhost:8082";

        // For demo purposes, return the first track or a dummy one
        return audioPostRepository.findAll().stream().findFirst()
                .map(post -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("trackName", post.getTitle());
                    map.put("artistName", post.getUser().getUsername());
                    map.put("trackImage", baseUrl + "/content/" + post.getCover_path());
                    map.put("audioUrl", baseUrl + "/content/" + post.getAudio_path());
                    map.put("duration", 0);
                    return ResponseEntity.ok(map);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tracks/search")
    public ResponseEntity<List<Map<String, Object>>> searchTracks(
            @org.springframework.web.bind.annotation.RequestParam String query) {
        List<AudioPost> posts = audioPostRepository.findByTitleContainingIgnoreCase(query);

        String baseUrl = "http://localhost:8082";

        List<Map<String, Object>> result = posts.stream().map(post -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", post.getId());
            map.put("title", post.getTitle());
            map.put("artist", post.getUser().getUsername());
            map.put("coverImage", baseUrl + "/content/" + post.getCover_path());
            map.put("audioUrl", baseUrl + "/content/" + post.getAudio_path());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
