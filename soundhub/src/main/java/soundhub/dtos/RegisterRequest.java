package soundhub.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

public record RegisterRequest(
        @NotBlank@Size(max = 64) String name,
        @NotBlank @Size(max = 64) String surname,
        @NotBlank @Size(max = 64) String username,
        @NotBlank @Size(max = 64) String email,
        @NotBlank @Size(max = 32) String dni,
        @NotNull @Min(0) @Max(120) Integer age,
        @NotBlank @Size(min = 8, max = 256) String password
) {}