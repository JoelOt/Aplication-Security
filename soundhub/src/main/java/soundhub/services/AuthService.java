package soundhub.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import soundhub.dtos.*;
import soundhub.entities.Role;
import soundhub.entities.Users;
import soundhub.repositories.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.username()))
            throw new IllegalArgumentException("Username already exists");

        if (userRepository.existsByEmail(request.email()))
            throw new IllegalArgumentException("Email already exists");

        if (userRepository.existsByDni(request.dni()))
            throw new IllegalArgumentException("DNI already exists");

        Users user = new Users();
        user.setName(request.name());
        user.setSurname(request.surname());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setDni(request.dni());
        user.setAge(request.age());
        user.setPassword(passwordEncoder.encode(request.password())); // Hash password with BCrypt
        user.setRole(Role.REGULAR);

        Users saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getName(),
                saved.getSurname(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getDni(),
                saved.getAge(),
                saved.getRole().name());
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        Users user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtService.generateToken(user.getUsername());
        return new LoginResponse(token);
    }

    public void changePassword(String username, ChangePasswordRequest request) {

        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword()))
            throw new IllegalArgumentException("Old password is incorrect");

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public UserResponse getCurrentUser(String username) {

        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getSurname(),
                user.getUsername(),
                user.getEmail(),
                user.getDni(),
                user.getAge(),
                user.getRole().name());
    }
}