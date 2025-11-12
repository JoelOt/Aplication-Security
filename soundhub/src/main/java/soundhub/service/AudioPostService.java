package soundhub.service;


import org.springframework.stereotype.Service;
import soundhub.model.AudioPost;
import soundhub.model.Users;
import soundhub.repository.AudioPostRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AudioPostService {

    private final AudioPostRepository audioPostRepository;

    public AudioPostService(AudioPostRepository audioPostRepository) {
        this.audioPostRepository = audioPostRepository;
    }

    public AudioPost createAudioPost(AudioPost audioPost) {
        return audioPostRepository.save(audioPost);
    }

    public void deleteAudioPost(Long id, Users user) {
        AudioPost post = audioPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audio post not found"));

        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own posts");
        }

        audioPostRepository.delete(post);
    }

    public List<AudioPost> getAllAudioPosts() {
        return audioPostRepository.findAll();
    }

    public Optional<AudioPost> getAudioPostById(Long id) {
        return audioPostRepository.findById(id);
    }

    public List<AudioPost> getAudioPostsByUser(Users user) {
        return audioPostRepository.findByUser(user);
    }

}