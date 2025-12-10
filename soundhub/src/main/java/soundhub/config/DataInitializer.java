package soundhub.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import soundhub.entities.Role;
import soundhub.entities.User;
import soundhub.entities.AudioPost;
import soundhub.repositories.AudioPostRepository;
import soundhub.repositories.UserRepository;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final AudioPostRepository audioPostRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            User admin = createUserIfNotFound("admin1", "Admin", "One", "admin1@example.com", "ID-ADM-0001", 34,
                    Role.ROLE_REGULAR);
            User coldplay = createUserIfNotFound("coldplay", "Coldplay", "Band", "coldplay@example.com",
                    "ID-CLDP-0002", 26, Role.ROLE_ARTIST);
            User beatles = createUserIfNotFound("beatles", "The Beatles", "Band", "beatles@example.com",
                    "ID-BTLS-0003", 28, Role.ROLE_ARTIST);
            User twentyonepilots = createUserIfNotFound("twentyonepilots", "Twenty One", "Pilots",
                    "twentyonepilots@example.com", "ID-TOP-0004", 27, Role.ROLE_ARTIST);
            User alice = createUserIfNotFound("alice_user", "Alice", "Doe", "alice@example.com", "ID-ALC-0005", 22,
                    Role.ROLE_REGULAR);
            User bob = createUserIfNotFound("bob_user", "Bob", "Doe", "bob@example.com", "ID-BOB-0006", 24,
                    Role.ROLE_REGULAR);

            createAudioPostIfNotFound(coldplay, "Alternative", "covers/1.jpg", "audio/1.mp3", "Yellow",
                    "Coldplay single");
            createAudioPostIfNotFound(coldplay, "Alternative", "covers/2.jpg", "audio/2.mp3", "Fly O",
                    "Coldplay track");
            createAudioPostIfNotFound(beatles, "Rock", "covers/3.jpg", "audio/3.mp3", "Here Comes the Sun",
                    "The Beatles classic");
            createAudioPostIfNotFound(twentyonepilots, "Alternative", "covers/4.jpg", "audio/4.mp3", "Car Radio",
                    "Twenty One Pilots");
        };
    }

    private User createUserIfNotFound(String username, String name, String surname, String email, String dni, int age,
                                      Role role) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setFirstName(name);
            user.setLastName(surname);
            user.setEmail(email);
            user.setDni(dni);
            user.setAge(age);
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole(role);
            return userRepository.save(user);
        });
    }

    private void createAudioPostIfNotFound(User user, String genre, String coverPath, String audioPath, String title,
                                           String description) {
        if (user != null && audioPostRepository.findByUserIdAndTitle(user.getId(), title).isEmpty()) {
            AudioPost post = new AudioPost();
            post.setUser(user);
            post.setGenre(genre);
            post.setCover_path(coverPath);
            post.setAudio_path(audioPath);
            post.setTitle(title);
            post.setDescription(description);
            audioPostRepository.save(post);
        }
    }
}
