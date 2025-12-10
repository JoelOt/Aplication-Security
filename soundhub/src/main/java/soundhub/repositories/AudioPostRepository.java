package soundhub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import soundhub.entities.AudioPost;

import java.util.List;
import java.util.Optional;

@Repository
public interface AudioPostRepository extends JpaRepository<AudioPost, Long> {

    List<AudioPost> findByUserId(Long userId);

    Optional<AudioPost> findByUserIdAndTitle(Long userId, String title);

    List<AudioPost> findByTitleContainingIgnoreCase(String title);


}

