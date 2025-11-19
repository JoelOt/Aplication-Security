package soundhub.dtos;

public record AudioPostResponse(
        Long id,
        String title,
        String description,
        String genre,
        String coverPath,
        String audioPath,
        String username
) {}