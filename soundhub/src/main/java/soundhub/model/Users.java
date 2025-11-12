package soundhub.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Check;

@Entity
@Data
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_users_username", columnNames = {"Username"}),
        @UniqueConstraint(name = "uq_users_dni", columnNames = {"Dni"})
    },
    indexes = {
        @Index(name = "idx_users_role", columnList = "Role")
    }
)

@Check(constraints = "Age BETWEEN 0 AND 120")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @Column(name = "Name", nullable = false, length = 64)
    private String name;

    @Column(name = "Surname", nullable = false, length = 64)
    private String surname;

    @Column(name = "Username", nullable = false, length = 64)
    private String username;

    @Column(name = "Dni", nullable = false, length = 16)
    private String dni;

    @Column(name = "Age", nullable = false)
    private Integer age;

    @Column(name = "Password", nullable = false, length = 256)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false, length = 20)
    private Role role;
}
