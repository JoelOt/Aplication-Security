package soundhub.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.Check;

@Data
@Entity
@Table(name = "users")
@Check(constraints = "Age BETWEEN 0 AND 120")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 64)
    @NotBlank
    private String name;

    @Column(nullable = false, length = 64)
    @NotBlank
    private String surname;

    @Column(nullable = false, unique = true, length = 64)
    @NotBlank
    private String username;

    @Column(nullable = false, unique = true, length = 128)
    @NotBlank
    @Convert(converter = soundhub.utils.EncryptorConverter.class)
    private String dni;

    @Column(nullable = false)
    @Min(0)
    @Max(120)
    private Integer age;

    @Column(nullable = false, length = 256, unique = true)
    @Convert(converter = soundhub.utils.EncryptorConverter.class)
    private String email;

    @Column(nullable = false, length = 256)
    @NotBlank
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;
}
