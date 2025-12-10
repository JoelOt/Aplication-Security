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

import java.util.List;
import java.util.Objects;

import com.mpatric.mp3agic.InvalidDataException;
import com.mpatric.mp3agic.Mp3File;
import com.mpatric.mp3agic.NotSupportedException;
import com.mpatric.mp3agic.UnsupportedTagException;
import net.coobird.thumbnailator.Thumbnails;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AudioPostService {

    private final AudioPostRepository audioPostRepository;
    private final UserRepository userRepository;
    private final VirusTotalService virusTotalService;

    @Value("${storage.base-dir}")
    private String baseDir;

    private String audioDir;
    private String coverDir;

    private static final long MAX_IMAGE_BYTES = 1L * 1024 * 1024; // 1 MB
    private static final long MAX_AUDIO_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final int MAX_AUDIO_SECONDS = 10 * 60; // 5 min
    private static final int MAX_IMAGE_DIMENSION = 1080; // px

    @PostConstruct
    public void init() {
        this.audioDir = baseDir + "/audio/";
        this.coverDir = baseDir + "/covers/";
    }

    // ------------------------------------------------------------------------
    // CREATE POST
    // ------------------------------------------------------------------------
    public AudioPostResponse uploadAudioPost(Long userId, AudioPostRequest request) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MultipartFile coverFile = request.coverFile();
        MultipartFile audioFile = request.audioFile();

        // SIZE, EXTENSION & MIME
        validateFiles(coverFile, audioFile);

        // DURATION
        int durationSeconds = getAudioDurationSeconds(audioFile);
        if (durationSeconds > MAX_AUDIO_SECONDS) {
            throw new IllegalArgumentException("Audio duration must be <= 10 minutes");
        }

        // PROCESS IMAGE: resize (if >1080px) & remove metadata
        String coverExt = getExtension(Objects.requireNonNull(coverFile.getOriginalFilename())).toLowerCase();
        if (coverExt.equals("jpeg")) {
            coverExt = "jpg";
        }
        if (!coverExt.equals("jpg") && !coverExt.equals("png")) {
            // por si llegamos aquí, aunque ya se validó antes
            throw new IllegalArgumentException("Cover must be JPG or PNG");
        }

        byte[] processedImageBytes = processImage(coverFile, coverExt);

        // PROCESS AUDIO: remove metadata
        byte[] processedAudioBytes = processAudio(audioFile);

        // SAVE FILES WITH UUID
        String coverFilename = saveBytesWithUuid(processedImageBytes, coverDir, coverExt);
        String audioFilename = saveBytesWithUuid(processedAudioBytes, audioDir, "mp3");

        // CREATE ENTITY & SAVE IN DB
        AudioPost post = new AudioPost();
        post.setUser(user);
        post.setTitle(request.title());
        post.setDescription(request.description());
        post.setGenre(request.genre());
        post.setCover_path(coverFilename);
        post.setAudio_path(audioFilename);

        AudioPost saved = audioPostRepository.save(post);

        // RETURN DTO
        return new AudioPostResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getGenre(),
                saved.getCover_path(),
                saved.getAudio_path(),
                user.getUsername());
    }

    // ------------------------------------------------------------------------
    // DELETE POST
    // ------------------------------------------------------------------------
    public void deleteAudioPost(Long userId, Long postId) {
        AudioPost post = audioPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("AudioPost not found"));

        if (!Objects.equals(post.getUser().getId(), userId)) {
            throw new SecurityException("Cannot delete another user's post");
        }

        // DELETE PHYSICAL FILES
        File coverFile = new File(coverDir + post.getCover_path());
        File audioFile = new File(audioDir + post.getAudio_path());
        coverFile.delete();
        audioFile.delete();

        audioPostRepository.delete(post);
    }

    // ------------------------------------------------------------------------
    // GET POSTS
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // VALIDATION HELPERS
    // ------------------------------------------------------------------------
    private void validateFiles(MultipartFile cover, MultipartFile audio) {
        if (cover == null || audio == null || cover.isEmpty() || audio.isEmpty()) {
            throw new IllegalArgumentException("Cover and audio files are required");
        }

        // SIZE
        if (cover.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("Image size must be <= 1 MB");
        }
        if (audio.getSize() > MAX_AUDIO_BYTES) {
            throw new IllegalArgumentException("Audio size must be <= 10 MB");
        }

        // EXTENSIONS
        String coverExt = getExtension(Objects.requireNonNull(cover.getOriginalFilename())).toLowerCase();
        String audioExt = getExtension(Objects.requireNonNull(audio.getOriginalFilename())).toLowerCase();

        if (!(coverExt.equals("jpg") || coverExt.equals("jpeg") || coverExt.equals("png"))) {
            throw new IllegalArgumentException("Cover must be JPG or PNG");
        }
        if (!audioExt.equals("mp3")) {
            throw new IllegalArgumentException("Audio must be MP3");
        }

        // MIME TYPE
        try {
            String coverMime = detectMimeType(cover);
            String audioMime = detectMimeType(audio);

            if (!("image/jpeg".equals(coverMime) || "image/png".equals(coverMime))) {
                throw new IllegalArgumentException("Cover file MIME type not allowed");
            }
            if (!"audio/mpeg".equals(audioMime)) {
                throw new IllegalArgumentException("Audio file MIME type must be audio/mpeg (MP3)");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not verify file types", e);
        }

        // -------------------------
        // VIRUS TOTAL
        try {
            System.out.println("Scanning audio file with VirusTotal...");
            if (!virusTotalService.isFileSafe(audio)) {
                throw new IllegalArgumentException("Audio file contains malicious content");
            }

            System.out.println("Scanning cover image with VirusTotal...");
            if (!virusTotalService.isFileSafe(cover)) {
                throw new IllegalArgumentException("Cover image contains malicious content");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("VirusTotal scan interrupted", e);
        } catch (IOException e) {
            throw new RuntimeException("VirusTotal scan failed", e);
        }
        // -------------------------
    }

    private String getExtension(String filename) {
        if (filename == null)
            return "";
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1)
            return "";
        return filename.substring(dotIndex + 1);
    }

    private String detectMimeType(MultipartFile file) throws IOException {
        // Temp file with MultipartFile content
        Path temp = Files.createTempFile("upload-", ".tmp");
        try {
            Files.write(temp, file.getBytes());
            return Files.probeContentType(temp);
        } finally {
            Files.deleteIfExists(temp);
        }
    }

    // ------------------------------------------------------------------------
    // Helpers de audio / imagen / guardado
    // ------------------------------------------------------------------------
    private int getAudioDurationSeconds(MultipartFile audio) throws IOException {
        File temp = File.createTempFile("audio-", ".mp3");
        try {
            audio.transferTo(temp);
            Mp3File mp3File = new Mp3File(temp);
            return (int) mp3File.getLengthInSeconds();
        } catch (UnsupportedTagException | InvalidDataException e) {
            throw new IllegalArgumentException("Invalid MP3 file", e);
        } finally {
            temp.delete();
        }
    }

    private byte[] processImage(MultipartFile coverFile, String format) throws IOException {
        // format: "jpg" OR "png"
        byte[] bytes = coverFile.getBytes();
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(bytes));
        if (original == null) {
            throw new IllegalArgumentException("Invalid image file");
        }

        int width = original.getWidth();
        int height = original.getHeight();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
            double scale = Math.min(
                    (double) MAX_IMAGE_DIMENSION / width,
                    (double) MAX_IMAGE_DIMENSION / height);
            int newWidth = (int) Math.round(width * scale);
            int newHeight = (int) Math.round(height * scale);

            Thumbnails.of(original)
                    .size(newWidth, newHeight)
                    .outputFormat(format)
                    .toOutputStream(baos);
        } else {
            Thumbnails.of(original)
                    .size(width, height)
                    .outputFormat(format)
                    .toOutputStream(baos);
        }

        return baos.toByteArray();
    }

    private byte[] processAudio(MultipartFile audioFile) throws IOException {
        File tempInput = null;
        File tempOutput = null;
        try {
            // Create temporary input file from MultipartFile
            tempInput = File.createTempFile("audio-input-", ".mp3");
            audioFile.transferTo(tempInput);

            // Read the MP3 file
            Mp3File mp3File = new Mp3File(tempInput);

            // Create temporary output file
            tempOutput = File.createTempFile("audio-output-", ".mp3");

            // Remove all metadata tags (ID3v1, ID3v2, custom tags)
            if (mp3File.hasId3v1Tag()) {
                mp3File.removeId3v1Tag();
            }
            if (mp3File.hasId3v2Tag()) {
                mp3File.removeId3v2Tag();
            }
            if (mp3File.hasCustomTag()) {
                mp3File.removeCustomTag();
            }

            // Save the cleaned MP3 to the output file
            mp3File.save(tempOutput.getAbsolutePath());

            // Read the cleaned MP3 bytes
            return Files.readAllBytes(tempOutput.toPath());

        } catch (UnsupportedTagException | InvalidDataException | NotSupportedException e) {
            throw new IllegalArgumentException("Invalid MP3 file", e);
        } finally {
            // Clean up temporary files
            if (tempInput != null && tempInput.exists()) {
                tempInput.delete();
            }
            if (tempOutput != null && tempOutput.exists()) {
                tempOutput.delete();
            }
        }
    }

    private String saveBytesWithUuid(byte[] bytes, String dir, String extension) throws IOException {
        String uuid = UUID.randomUUID().toString();
        String filename = uuid + "." + extension;

        File directory = new File(dir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        Path targetPath = Path.of(dir, filename);
        Files.write(targetPath, bytes);

        return filename;
    }
}