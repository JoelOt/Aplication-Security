package soundhub.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import soundhub.dto.TrackDTO;
import soundhub.entities.AudioPost;
import soundhub.repositories.AudioPostRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackService {

    private final AudioPostRepository audioPostRepository;

    public List<TrackDTO> getRecommendedTracks() {
        List<AudioPost> posts = audioPostRepository.findAll();
        return mapToTrackDTOs(posts);
    }

    public List<TrackDTO> searchTracks(String query) {
        List<AudioPost> posts = audioPostRepository.findByTitleContainingIgnoreCase(query);
        return mapToTrackDTOs(posts);
    }

    private List<TrackDTO> mapToTrackDTOs(List<AudioPost> posts) {
        String baseUrl = "https://localhost:4200/api";
        return posts.stream().map(post -> new TrackDTO(
                post.getId(),
                post.getTitle(),
                post.getUser().getUsername(),
                baseUrl + "/content/" + post.getCover_path(),
                baseUrl + "/content/" + post.getAudio_path())).collect(Collectors.toList());
    }
}
