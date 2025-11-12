package soundhub.service;


import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import soundhub.exception.InvalidFileException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {

    private final Path audioStorage = Paths.get("storage/audio");
    private final Path coverStorage = Paths.get("storage/covers");

    public FileStorageService() throws IOException {
        Files.createDirectories(audioStorage);
        Files.createDirectories(coverStorage);
    }

    public String storeAudio(MultipartFile file) {
        return storeFile(file, audioStorage);
    }

    public String storeCover(MultipartFile file) {
        return storeFile(file, coverStorage);
    }

    private String storeFile(MultipartFile file, Path directory) {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (filename.contains("..")) {
            throw new InvalidFileException("Filename contains invalid path sequence");
        }

        try {
            Path targetLocation = directory.resolve(filename);
            file.transferTo(targetLocation.toFile());
            return targetLocation.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + filename, ex);
        }
    }
}