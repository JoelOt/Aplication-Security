package soundhub.dto;

import org.springframework.web.multipart.MultipartFile;

public record AudioPostRequest(
    String title,
    String genre,
    String description,
    MultipartFile audioFile,
    MultipartFile coverFile
) {}