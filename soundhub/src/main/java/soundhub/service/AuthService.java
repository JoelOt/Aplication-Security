package soundhub.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import soundhub.dto.ChangePasswordRequest;
import soundhub.dto.LoginRequest;
import soundhub.dto.RegisterRequest;
import soundhub.dto.UserResponse;
import soundhub.entity.Role;
import soundhub.entity.Users;
import soundhub.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (userRepository.existsByDni(request.dni())) {
            throw new IllegalArgumentException("DNI already exists");
        }

        Users user = new Users();
        user.setName(request.name());
        user.setSurname(request.surname());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setDni(request.dni());
        user.setAge(request.age());
        user.setPassword(request.password()); // Already hashed
        user.setRole(Role.REGULAR);

        Users saved = userRepository.save(user);

        return new UserResponse(saved.getId(), saved.getName(), saved.getSurname(),
                saved.getUsername(), saved.getEmail(), saved.getDni(),
                saved.getAge(), saved.getRole().name());
    }

    public String login(LoginRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        Users user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getPassword().equals(request.password())) { // compare hashes
            throw new IllegalArgumentException("Incorrect password");
        }

        return jwtService.generateToken(user.getUsername());
    }

    public void changePassword(int userId, ChangePasswordRequest request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getPassword().equals(request.oldPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(request.newPassword()); // Already hashed
        userRepository.save(user);
    }
}