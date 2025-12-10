package soundhub.dto;

public record TrackDTO(
        Long id,
        String title,
        String artist,
        String coverImage,
        String audioUrl) {
}
