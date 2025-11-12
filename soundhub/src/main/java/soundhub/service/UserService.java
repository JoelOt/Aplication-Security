package soundhub.service;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import soundhub.model.Users;
import soundhub.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EncryptionService encryptionService; // optional for AES encryption

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       EncryptionService encryptionService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.encryptionService = encryptionService;
    }

    // -----------------------
    // Register new user
    // -----------------------
    public Users registerUser(Users user) {
        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Optional: encrypt sensitive fields
        // user.setName(encryptionService.encrypt(user.getName()));
        // user.setSurname(encryptionService.encrypt(user.getSurname()));

        return userRepository.save(user);
    }

    // -----------------------
    // Get user info
    // -----------------------
    public Optional<Users> getUserInfo(String username) {
        return userRepository.findByUsername(username);
    }

    // -----------------------
    // Change password
    // -----------------------
    public void changePassword(String username, String currentPassword, String newPassword) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Hash new password and save
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // -----------------------
    // Reset password (optional)
    // -----------------------
    public void resetPassword(String username, String newPassword) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

}