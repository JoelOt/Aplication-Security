package soundhub.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Data
@Table(
        name = "download_log",
        indexes = {
                @Index(name = "idx_dl_user", columnList = "user_id"),
                @Index(name = "idx_dl_post", columnList = "audio_post_id"),
                @Index(name = "idx_dl_time", columnList = "downloaded_at")
        }
)
public class DownloadLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "audio_post_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private AudioPost audioPost;

    @Column(name = "downloaded_at", nullable = false)
    private LocalDateTime downloadedAt;
}