package soundhub.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "audio_post")
public class AudioPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "genre", nullable = false)
    private String genre;

    @Column(name = "cover_path", nullable = false)
    private String cover; // path to cover image on server

    @Column(name = "audio_path", nullable = false)
    private String audio; // path to audio file on server

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}