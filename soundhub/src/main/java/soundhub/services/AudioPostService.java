package soundhub.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import soundhub.dto.AudioPostRequest;
import soundhub.dto.AudioPostResponse;
import soundhub.entities.AudioPost;
import soundhub.entities.User;
import soundhub.repositories.AudioPostRepository;
import soundhub.repositories.UserRepository;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AudioPostService {

    private final AudioPostRepository audioPostRepository;
    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Value("${storage.base-dir}")
    private String baseDir;

    private String audioDir;
    private String coverDir;

    @jakarta.annotation.PostConstruct
    public void init() {
        this.audioDir = baseDir + "/audio/";
        this.coverDir = baseDir + "/covers/";
    }

    public AudioPostResponse uploadAudioPost(Long userId, AudioPostRequest request) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate file extensions and size
        validateFiles(request.coverFile(), request.audioFile());

        // Metadata cleaning could go here (strip tags, sanitize filenames)
        String coverPath = saveFile(request.coverFile(), coverDir);
        String audioPath = saveFile(request.audioFile(), audioDir);

        AudioPost post = new AudioPost();
        post.setUser(user);
        post.setTitle(request.title());
        post.setDescription(request.description());
        post.setGenre(request.genre());
        post.setCover_path(coverPath);
        post.setAudio_path(audioPath);

        AudioPost saved = audioPostRepository.save(post);

        return new AudioPostResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getGenre(),
                saved.getCover_path(),
                saved.getAudio_path(),
                user.getUsername());
    }

    public void deleteAudioPost(Long userId, Long postId) {
        AudioPost post = audioPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("AudioPost not found"));

        if (post.getUser().getId() != userId) {
            throw new SecurityException("Cannot delete another user's post");
        }

        new File(coverDir + post.getCover_path());
        new File(audioDir + post.getAudio_path());

        audioPostRepository.delete(post);
    }

    public List<AudioPostResponse> getUserAudioPosts(Long userId) {
        return audioPostRepository.findByUserId(userId).stream()
                .map(p -> new AudioPostResponse(
                        p.getId(),
                        p.getTitle(),
                        p.getDescription(),
                        p.getGenre(),
                        p.getCover_path(),
                        p.getAudio_path(),
                        p.getUser().getUsername()))
                .toList();
    }

    public AudioPostResponse getAudioPost(Long postId) {
        AudioPost p = audioPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("AudioPost not found"));

        return new AudioPostResponse(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getGenre(),
                p.getCover_path(),
                p.getAudio_path(),
                p.getUser().getUsername());
    }

    // ----------------------
    // Helper methods
    // ----------------------
    private void validateFiles(MultipartFile cover, MultipartFile audio) {
        if (cover.isEmpty() || audio.isEmpty()) {
            throw new IllegalArgumentException("Files cannot be empty");
        }

        if (!Objects.requireNonNull(cover.getContentType()).startsWith("image/")) {
            throw new IllegalArgumentException("Cover must be an image");
        }

        if (!Objects.requireNonNull(audio.getContentType()).startsWith("audio/")) {
            throw new IllegalArgumentException("Audio must be an audio file");
        }

        // TODO: Optional: antivirus scan here
    }

    private String saveFile(MultipartFile file, String dir) throws IOException {
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File target = new File(dir + filename);
        target.getParentFile().mkdirs();
        file.transferTo(target);
        return filename; // store relative path
    }
}
