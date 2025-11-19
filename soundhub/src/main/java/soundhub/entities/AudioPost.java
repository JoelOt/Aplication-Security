package soundhub.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(
        name = "audio_post",
        uniqueConstraints = @UniqueConstraint(name = "uq_audio_user_title", columnNames = {"user_id", "title"})
)
public class AudioPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(nullable = false, length = 50)
    private String genre;

    @Column(nullable = false, length = 255)
    private String cover_path; // path relative to storage/covers

    @Column(nullable = false, length = 255)
    private String audio_path; // path relative to storage/audio

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
}