package soundhub.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import soundhub.dto.TrackDTO;
import soundhub.services.TrackService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TrackController {

    private final TrackService trackService;

    @GetMapping("/tracks/recommended")
    public ResponseEntity<List<TrackDTO>> getRecommendedTracks() {
        return ResponseEntity.ok(trackService.getRecommendedTracks());
    }

    @GetMapping("/tracks/search")
    public ResponseEntity<List<TrackDTO>> searchTracks(@RequestParam String query) {
        return ResponseEntity.ok(trackService.searchTracks(query));
    }
}
