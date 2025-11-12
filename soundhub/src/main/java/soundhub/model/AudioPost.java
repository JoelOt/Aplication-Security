package soundhub.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
@Table(
    name = "audio_post",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_audio_user_title", columnNames = {"user_id", "title"})
    },
    indexes = {
        @Index(name = "idx_audio_user", columnList = "user_id"),
        @Index(name = "idx_audio_genre", columnList = "genre")
    }
)
public class AudioPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Users user;

    @Column(name = "genre", nullable = false, length = 50)
    private String genre;

    @Column(name = "cover_path", nullable = false, length = 255)
    private String cover; // ruta relativa

    @Column(name = "audio_path", nullable = false, length = 255)
    private String audio; // ruta relativa

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}