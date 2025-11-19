package soundhub.dtos;

public record UserResponse(
    int id,
    String name,
    String surname,
    String username,
    String email,
    String dni,
    int age,
    String role
) {}
