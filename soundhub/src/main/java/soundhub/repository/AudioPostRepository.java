package soundhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import soundhub.entity.AudioPost;

import java.util.List;
import java.util.Optional;

@Repository
public interface AudioPostRepository extends JpaRepository<AudioPost, Long> {

    List<AudioPost> findByUserId(int userId);

    Optional<AudioPost> findByUserIdAndTitle(int userId, String title);
}